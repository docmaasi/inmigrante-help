import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, Phone, User, Pill, Heart, Printer, Download } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function EmergencyInfoCard({ recipient }) {
  if (!recipient) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-600">Select a care recipient to view emergency info</p>
        </CardContent>
      </Card>
    );
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Emergency Info - ${recipient.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #e11d48; border-bottom: 3px solid #e11d48; padding-bottom: 10px; }
            h2 { color: #1e40af; margin-top: 20px; border-bottom: 1px solid #ddd; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; margin-right: 10px; }
            .badge { display: inline-block; padding: 4px 8px; background: #fee2e2; color: #991b1b; border-radius: 4px; margin: 2px; }
          </style>
        </head>
        <body>
          <h1>🚨 EMERGENCY INFORMATION</h1>
          <div class="section">
            <h2>Patient Information</h2>
            <p><span class="label">Name:</span> ${recipient.full_name}</p>
            ${recipient.date_of_birth ? `<p><span class="label">Date of Birth:</span> ${recipient.date_of_birth}</p>` : ''}
            ${recipient.primary_condition ? `<p><span class="label">Primary Condition:</span> ${recipient.primary_condition}</p>` : ''}
          </div>
          
          ${recipient.allergies ? `
            <div class="section">
              <h2>⚠️ ALLERGIES</h2>
              <p style="font-size: 18px; color: #991b1b; font-weight: bold;">${recipient.allergies}</p>
            </div>
          ` : ''}
          
          <div class="section">
            <h2>Emergency Contact</h2>
            ${recipient.emergency_contact_name ? `<p><span class="label">Name:</span> ${recipient.emergency_contact_name}</p>` : ''}
            ${recipient.emergency_contact_phone ? `<p><span class="label">Phone:</span> ${recipient.emergency_contact_phone}</p>` : ''}
          </div>
          
          <div class="section">
            <h2>Primary Physician</h2>
            ${recipient.primary_physician ? `<p><span class="label">Doctor:</span> Dr. ${recipient.primary_physician}</p>` : ''}
            ${recipient.physician_phone ? `<p><span class="label">Phone:</span> ${recipient.physician_phone}</p>` : ''}
          </div>
          
          ${recipient.notes ? `
            <div class="section">
              <h2>Additional Notes</h2>
              <p>${recipient.notes}</p>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px; border-top: 2px solid #ddd; padding-top: 20px; color: #666; font-size: 12px;">
            <p>Printed from FamilyCare.Help on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader className="border-b border-red-200 bg-red-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Emergency Information
          </CardTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="bg-white text-red-600 hover:bg-red-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Patient Info */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" />
            Patient Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-700 min-w-[100px]">Name:</span>
              <span className="text-slate-800 font-bold text-lg">{recipient.full_name}</span>
            </div>
            {recipient.date_of_birth && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-700 min-w-[100px]">DOB:</span>
                <span className="text-slate-800">{recipient.date_of_birth}</span>
              </div>
            )}
            {recipient.primary_condition && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-700 min-w-[100px]">Condition:</span>
                <Badge className="bg-blue-100 text-blue-800 border-0">
                  {recipient.primary_condition}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Allergies - Critical Section */}
        {recipient.allergies && (
          <div className="mb-6 p-4 rounded-lg border-2 border-red-400 bg-red-50">
            <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              ⚠️ ALLERGIES
            </h3>
            <p className="text-red-900 font-bold text-lg">{recipient.allergies}</p>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-orange-600" />
            Emergency Contact
          </h3>
          <div className="space-y-2">
            {recipient.emergency_contact_name && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-700 min-w-[80px]">Name:</span>
                <span className="text-slate-800">{recipient.emergency_contact_name}</span>
              </div>
            )}
            {recipient.emergency_contact_phone && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-700 min-w-[80px]">Phone:</span>
                <a href={`tel:${recipient.emergency_contact_phone}`} className="text-blue-600 hover:underline font-bold">
                  {recipient.emergency_contact_phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Primary Physician */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-600" />
            Primary Physician
          </h3>
          <div className="space-y-2">
            {recipient.primary_physician && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-700 min-w-[80px]">Doctor:</span>
                <span className="text-slate-800">Dr. {recipient.primary_physician}</span>
              </div>
            )}
            {recipient.physician_phone && (
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-700 min-w-[80px]">Phone:</span>
                <a href={`tel:${recipient.physician_phone}`} className="text-blue-600 hover:underline">
                  {recipient.physician_phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        {recipient.notes && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-2">Additional Notes</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{recipient.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}