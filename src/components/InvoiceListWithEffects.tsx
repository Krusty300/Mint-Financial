import React from 'react';
import { InvoiceList } from './InvoiceList';

// Simple wrapper for future enhancements
export const InvoiceListWithEffects: React.FC = () => {
  return <InvoiceList onCreateInvoice={() => {}} />;
};
