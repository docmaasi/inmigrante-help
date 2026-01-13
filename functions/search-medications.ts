/**
 * Search medications from FDA OpenFDA API
 * Returns medication names, dosages, and administration info
 */

export default async function handler(req, context) {
  const { query } = req.body;

  if (!query || query.length < 2) {
    return { results: [] };
  }

  try {
    // Search FDA drug label database
    const searchUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(query)}"*+openfda.generic_name:"${encodeURIComponent(query)}"*&limit=10`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return { results: [] };
    }

    // Process and format results
    const medications = data.results.map(drug => {
      const brandName = drug.openfda?.brand_name?.[0] || '';
      const genericName = drug.openfda?.generic_name?.[0] || '';
      const dosageForm = drug.dosage_and_administration?.[0] || drug.openfda?.dosage_form?.[0] || '';
      const route = drug.openfda?.route?.[0] || '';
      
      // Extract dosage info from dosage_and_administration field
      let dosage = '';
      if (dosageForm) {
        // Try to extract common dosage patterns like "10 mg", "500 mcg", etc.
        const dosageMatch = dosageForm.match(/(\d+\.?\d*)\s*(mg|mcg|g|ml|units?)/i);
        if (dosageMatch) {
          dosage = `${dosageMatch[1]} ${dosageMatch[2].toLowerCase()}`;
        }
      }

      return {
        name: brandName || genericName,
        generic_name: genericName,
        brand_name: brandName,
        dosage: dosage,
        form: drug.openfda?.dosage_form?.[0] || '',
        route: route,
        manufacturer: drug.openfda?.manufacturer_name?.[0] || ''
      };
    });

    // Remove duplicates and filter out empty names
    const uniqueMeds = medications
      .filter(med => med.name)
      .filter((med, index, self) => 
        index === self.findIndex(m => m.name.toLowerCase() === med.name.toLowerCase())
      );

    return { results: uniqueMeds };
  } catch (error) {
    console.error('Error searching medications:', error);
    return { results: [], error: error.message };
  }
}