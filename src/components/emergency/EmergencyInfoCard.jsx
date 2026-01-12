import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Phone, User, Heart, Pill, Printer } from 'lucide-react';

export default function EmergencyInfoCard({ recipient, medications = [] }) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Emergency Info - ${recipient.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #dc2626; border-bottom: 3px solid #dc2626; padding-bottom: 10px; }
            h2 { color: #1e40af; margin-top: 20px; }
            .section { margin: 15px 0; }
            .label { font-weight: bold; color: #475569; }
            .alert { background: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 10px 0; }
            ul { list-style: none; padding: 0; }
            li { padding: 5px 0; }
          </style>
        </head>
        <body>
          <h1>🚨 EMERGENCY INFORMATION</h1>
          <h2>Patient: ${recipient.full_name}</h2>
          ${recipient.date_of_birth ? `<div class="section"><span class="label">Date of Birth:</span> ${recipient.date_of_birth}</div>` : ''}
          
          ${recipient.allergies ? `
            <div class="alert">
              <h2>⚠️ ALLERGIES</h2>
              <p style="font-size: 18px; font-weight: bold;">${recipient.allergies}</p>
            </div>
          ` : ''}
          
          ${recipient.primary_condition ? `
            <div class="section">
              <span class="label">Primary Condition:</span> ${recipient.primary_condition}
            </div>
          ` : ''}
          
          <h2>Current Medications</h2>
          <ul>
            ${medications.map(med => `
              <li>• ${med.medication_name} - ${med.dosage} ${med.frequency ? `(${med.frequency})` : ''}</li>
            `).join('')}
          </ul>
          
          <h2>Emergency Contacts</h2>
          ${recipient.emergency_contact_name ? `
            <div class="section">
              <span class="label">${recipient.emergency_contact_name}</span><br>
              ${recipient.emergency_contact_phone || ''}
            </div>
          ` : ''}
          
          ${recipient.primary_physician ? `
            <div class="section">
              <span class="label">Primary Physician:</span> Dr. ${recipient.primary_physician}<br>
              ${recipient.physician_phone || ''}
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 12px; color: #64748b;">
            Generated from FamilyCare.Help on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="shadow-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader className="border-b border-red-200 bg-red-100/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-6 h-6" />
            Emergency Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Patient Name */}
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-600">Patient</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{recipient.full_name}</p>
          {recipient.date_of_birth && (
            <p className="text-sm text-slate-600 mt-1">DOB: {recipient.date_of_birth}</p>
          )}
        </div>

        {/* Allergies - CRITICAL */}
        {recipient.allergies && (
          <div className="bg-red-600 text-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">⚠️ ALLERGIES</span>
            </div>
            <p className="text-lg font-bold">{recipient.allergies}</p>
          </div>
        )}

        {/* Primary Condition */}
        {recipient.primary_condition && (
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-slate-600">Primary Condition</span>
            </div>
            <p className="font-semibold text-slate-800">{recipient.primary_condition}</p>
          </div>
        )}

        {/* Current Medications */}
        {medications.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-600">Current Medications</span>
            </div>
            <ul className="space-y-2">
              {medications.slice(0, 5).map((med, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-semibold text-slate-800">{med.medication_name}</span>
                  <span className="text-slate-600"> - {med.dosage}</span>
                  {med.frequency && <span className="text-slate-500 text-xs ml-2">({med.frequency})</span>}
                </li>
              ))}
              {medications.length > 5 && (
                <li className="text-sm text-slate-500 italic">+{medications.length - 5} more medications</li>
              )}
            </ul>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="space-y-3">
          {recipient.emergency_contact_name && (
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Emergency Contact</span>
              </div>
              <p className="font-semibold text-slate-800">{recipient.emergency_contact_name}</p>
              {recipient.emergency_contact_phone && (
                <a href={`tel:${recipient.emergency_contact_phone}`} className="text-blue-600 hover:underline">
                  {recipient.emergency_contact_phone}
                </a>
              )}
            </div>
          )}

          {recipient.primary_physician && (
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-slate-600">Primary Physician</span>
              </div>
              <p className="font-semibold text-slate-800">Dr. {recipient.primary_physician}</p>
              {recipient.physician_phone && (
                <a href={`tel:${recipient.physician_phone}`} className="text-blue-600 hover:underline">
                  {recipient.physician_phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        {recipient.notes && (
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <span className="text-sm font-medium text-slate-600 block mb-2">Additional Notes</span>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{recipient.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}