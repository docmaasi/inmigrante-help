import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReportExporter({ title, dateRange, contentRef }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    if (!contentRef?.current) {
      toast.error('Report content not available');
      return;
    }

    setIsExporting(true);
    try {
      const element = contentRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      toast.success('Report exported as PDF');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export report');
    } finally {
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