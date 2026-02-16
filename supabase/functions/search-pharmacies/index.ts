import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { zip_code, query } = body;

    if (!zip_code || zip_code.length < 5) {
      return new Response(
        JSON.stringify({ results: [], error: 'Valid zip code required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the NPI Registry API (free, no API key required)
    // Taxonomy 333600000X = Community/Retail Pharmacy
    const params = new URLSearchParams({
      version: '2.1',
      taxonomy_description: 'pharmacy',
      postal_code: zip_code.substring(0, 5),
      limit: '15',
      skip: '0',
    });

    // If user typed a pharmacy name, add it as organization name filter
    if (query && query.length >= 2) {
      params.set('organization_name', `*${query}*`);
    }

    const npiUrl = `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`;
    const response = await fetch(npiUrl);

    if (!response.ok) {
      throw new Error(`NPI Registry returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform NPI results into a clean format
    const pharmacies = data.results
      .filter((r: any) => r.enumeration_type === 'NPI-2') // Organization results only
      .map((r: any) => {
        const address = r.addresses?.find((a: any) => a.address_purpose === 'LOCATION') ||
                        r.addresses?.[0] || {};
        const phone = address.telephone_number || '';

        return {
          name: formatPharmacyName(r.basic?.organization_name || ''),
          address: formatAddress(address.address_1, address.address_2),
          city: titleCase(address.city || ''),
          state: address.state || '',
          zip: (address.postal_code || '').substring(0, 5),
          phone: formatPhone(phone),
          npi: r.number || '',
        };
      })
      .filter((p: any) => p.name); // Remove entries without names

    return new Response(
      JSON.stringify({ results: pharmacies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Pharmacy search error:', error);
    return new Response(
      JSON.stringify({ results: [], error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatPharmacyName(name: string): string {
  // NPI data is often ALL CAPS, convert to title case
  return titleCase(name);
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatAddress(addr1?: string, addr2?: string): string {
  const parts = [addr1, addr2].filter(Boolean).map(a => titleCase(a || ''));
  return parts.join(', ');
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
