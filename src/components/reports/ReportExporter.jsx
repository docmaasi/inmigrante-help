import React, { useState } from 'react';
import { Button } from '../ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReportExporter({ title, dateRange, content }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '0';
      tempContainer.style.top = '0';
      tempContainer.style.width = '1200px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.zIndex = '-9999';

      // Add content to temp container
      const reportHTML = document.createElement('div');
      reportHTML.innerHTML = `
        <div style="margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
          <h1 style="font-size: 28px; font-weight: bold; color: #1e293b; margin: 0 0 8px 0;">${title}</h1>
          <p style="color: #64748b; margin: 0;">Generated on ${new Date().toLocaleDateString()} | Period: ${dateRange.startDate} to ${dateRange.endDate}</p>
        </div>
      `;

      // Clone and add the content
      const contentClone = document.createElement('div');
      contentClone.appendChild(content.cloneNode(true));
      reportHTML.appendChild(contentClone);

      tempContainer.appendChild(reportHTML);
      document.body.appendChild(tempContainer);

      // Convert to canvas
      const canvas = await html2canvas(reportHTML, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const fileName = `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      toast.success('Report exported as PDF');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export report');
    } finally {
      // Clean up
      const tempContainer = document.querySelector('[style*="position: fixed"]');
      if (tempContainer) {
        tempContainer.remove();
      }
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      disabled={isExporting}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          Export as PDF
        </>
      )}
    </Button>
  );
}