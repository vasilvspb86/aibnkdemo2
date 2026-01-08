-- Add INSERT policy for invoices on demo org
CREATE POLICY "Authenticated users can create demo invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = '11111111-1111-1111-1111-111111111111'
);

-- Add UPDATE policy for invoices on demo org
CREATE POLICY "Authenticated users can update demo invoices"
ON public.invoices FOR UPDATE
TO authenticated
USING (
  organization_id = '11111111-1111-1111-1111-111111111111'
);

-- Add INSERT policy for invoice line items on demo org
CREATE POLICY "Authenticated users can create demo invoice items"
ON public.invoice_line_items FOR INSERT
TO authenticated
WITH CHECK (
  invoice_id IN (
    SELECT id FROM invoices 
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'
  )
);

-- Add SELECT policy for invoice line items on demo org
CREATE POLICY "Authenticated users can view demo invoice items"
ON public.invoice_line_items FOR SELECT
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM invoices 
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'
  )
);