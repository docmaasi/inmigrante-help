import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MedicationResult {
  name: string;
  generic_name: string;
  dosage: string;
  form: string;
  route: string;
  manufacturer: string;
}

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

    const { query } = await req.json();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ results: [], error: 'Query must be at least 2 characters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(
      query
    )}*+openfda.generic_name:${encodeURIComponent(query)}*&limit=10`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      // FDA API returns 404 when no results found
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ results: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`FDA API error: ${response.status}`);
    }

    const data = await response.json();

    const results: MedicationResult[] = (data.results || []).map((item: any) => ({
      name: item.openfda?.brand_name?.[0] || 'Unknown',
      generic_name: item.openfda?.generic_name?.[0] || '',
      dosage: item.dosage_and_administration?.[0]?.substring(0, 200) || '',
      form: item.openfda?.dosage_form?.[0] || '',
      route: item.openfda?.route?.[0] || '',
      manufacturer: item.openfda?.manufacturer_name?.[0] || '',
    }));

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching medications:', error);
    return new Response(
      JSON.stringify({ results: [], error: 'Failed to search medications' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
