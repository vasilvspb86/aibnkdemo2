-- Add DELETE policy for invoice_line_items for authenticated users (demo data)
CREATE POLICY "Authenticated users can delete demo invoice items"
ON public.invoice_line_items
FOR DELETE
TO authenticated
USING (invoice_id IN (
  SELECT id FROM invoices WHERE organization_id = '11111111-1111-1111-1111-111111111111'::uuid
));

-- Add DELETE policy for invoices for authenticated users (demo data)
CREATE POLICY "Authenticated users can delete demo invoices"
ON public.invoices
FOR DELETE
TO authenticated
USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);