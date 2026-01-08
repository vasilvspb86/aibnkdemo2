-- =============================================
-- AIBNK Database Schema
-- =============================================

-- ENUMS
CREATE TYPE public.kyb_status AS ENUM ('draft', 'submitted', 'in_review', 'needs_info', 'approved', 'account_ready', 'rejected');
CREATE TYPE public.legal_form AS ENUM ('fz_llc', 'llc', 'sole_establishment', 'branch', 'free_zone', 'other');
CREATE TYPE public.document_type AS ENUM ('trade_license', 'moa', 'passport', 'emirates_id', 'proof_of_address', 'bank_statement', 'other');
CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('draft', 'pending_approval', 'scheduled', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE public.card_type AS ENUM ('physical', 'virtual');
CREATE TYPE public.card_status AS ENUM ('requested', 'active', 'frozen', 'cancelled', 'expired');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.expense_status AS ENUM ('pending', 'approved', 'rejected', 'reimbursed');
CREATE TYPE public.credit_status AS ENUM ('not_eligible', 'pre_qualified', 'applied', 'under_review', 'approved', 'rejected', 'active', 'closed');

-- =============================================
-- ORGANIZATIONS
-- =============================================
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  legal_form legal_form,
  trade_license_number TEXT,
  jurisdiction TEXT,
  registered_address TEXT,
  business_activity TEXT,
  expected_monthly_volume NUMERIC,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organizations"
ON public.organizations FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own organizations"
ON public.organizations FOR UPDATE
USING (auth.uid() = owner_id);

-- =============================================
-- ORGANIZATION MEMBERS (for team access)
-- =============================================
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their organization memberships"
ON public.organization_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Org owners can manage members"
ON public.organization_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- KYB APPLICATIONS
-- =============================================
CREATE TABLE public.kyb_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status kyb_status NOT NULL DEFAULT 'draft',
  company_name TEXT,
  legal_form legal_form,
  trade_license_number TEXT,
  jurisdiction TEXT,
  registered_address TEXT,
  business_activity TEXT,
  expected_monthly_volume NUMERIC,
  ubos JSONB DEFAULT '[]',
  directors JSONB DEFAULT '[]',
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kyb_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYB applications"
ON public.kyb_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create KYB applications"
ON public.kyb_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYB applications"
ON public.kyb_applications FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- KYB DOCUMENTS
-- =============================================
CREATE TABLE public.kyb_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kyb_application_id UUID REFERENCES public.kyb_applications(id) ON DELETE CASCADE NOT NULL,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kyb_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their KYB documents"
ON public.kyb_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kyb_applications 
    WHERE id = kyb_application_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload KYB documents"
ON public.kyb_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.kyb_applications 
    WHERE id = kyb_application_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their KYB documents"
ON public.kyb_documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.kyb_applications 
    WHERE id = kyb_application_id AND user_id = auth.uid()
  )
);

-- =============================================
-- KYB EVENTS (Status Timeline)
-- =============================================
CREATE TABLE public.kyb_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kyb_application_id UUID REFERENCES public.kyb_applications(id) ON DELETE CASCADE NOT NULL,
  status kyb_status NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kyb_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their KYB events"
ON public.kyb_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.kyb_applications 
    WHERE id = kyb_application_id AND user_id = auth.uid()
  )
);

-- =============================================
-- ACCOUNTS
-- =============================================
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  account_number TEXT NOT NULL UNIQUE,
  iban TEXT,
  currency TEXT NOT NULL DEFAULT 'AED',
  balance NUMERIC NOT NULL DEFAULT 0,
  available_balance NUMERIC NOT NULL DEFAULT 0,
  account_name TEXT NOT NULL DEFAULT 'Primary Account',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org accounts"
ON public.accounts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- TRANSACTIONS
-- =============================================
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  status transaction_status NOT NULL DEFAULT 'completed',
  description TEXT,
  reference TEXT,
  counterparty_name TEXT,
  counterparty_account TEXT,
  category TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions"
ON public.transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    JOIN public.organizations o ON a.organization_id = o.id
    WHERE a.id = account_id AND o.owner_id = auth.uid()
  )
);

-- =============================================
-- BENEFICIARIES
-- =============================================
CREATE TABLE public.beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  iban TEXT,
  swift_code TEXT,
  currency TEXT NOT NULL DEFAULT 'AED',
  country TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  vendor_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their beneficiaries"
ON public.beneficiaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their beneficiaries"
ON public.beneficiaries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  status payment_status NOT NULL DEFAULT 'draft',
  reference TEXT,
  purpose TEXT,
  scheduled_date DATE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payments"
ON public.payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their payments"
ON public.payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- PAYMENT LINKS
-- =============================================
CREATE TABLE public.payment_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  description TEXT,
  link_code TEXT NOT NULL UNIQUE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payment links"
ON public.payment_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their payment links"
ON public.payment_links FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- CARDS
-- =============================================
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  card_type card_type NOT NULL DEFAULT 'virtual',
  status card_status NOT NULL DEFAULT 'requested',
  card_number_last4 TEXT,
  cardholder_name TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  spending_limit NUMERIC,
  monthly_limit NUMERIC,
  expires_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org cards"
ON public.cards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  ) OR assigned_to = auth.uid()
);

CREATE POLICY "Org owners can manage cards"
ON public.cards FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- CARD CONTROLS
-- =============================================
CREATE TABLE public.card_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  per_transaction_limit NUMERIC,
  daily_limit NUMERIC,
  monthly_limit NUMERIC,
  allowed_categories TEXT[] DEFAULT '{}',
  blocked_categories TEXT[] DEFAULT '{}',
  online_enabled BOOLEAN NOT NULL DEFAULT true,
  contactless_enabled BOOLEAN NOT NULL DEFAULT true,
  atm_enabled BOOLEAN NOT NULL DEFAULT true,
  international_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.card_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their card controls"
ON public.card_controls FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cards c
    JOIN public.organizations o ON c.organization_id = o.id
    WHERE c.id = card_id AND (o.owner_id = auth.uid() OR c.assigned_to = auth.uid())
  )
);

CREATE POLICY "Org owners can manage card controls"
ON public.card_controls FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cards c
    JOIN public.organizations o ON c.organization_id = o.id
    WHERE c.id = card_id AND o.owner_id = auth.uid()
  )
);

-- =============================================
-- CARD TRANSACTIONS
-- =============================================
CREATE TABLE public.card_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  merchant_name TEXT,
  merchant_category TEXT,
  status transaction_status NOT NULL DEFAULT 'completed',
  declined_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their card transactions"
ON public.card_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cards c
    JOIN public.organizations o ON c.organization_id = o.id
    WHERE c.id = card_id AND (o.owner_id = auth.uid() OR c.assigned_to = auth.uid())
  )
);

-- =============================================
-- INVOICES
-- =============================================
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'AED',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invoices"
ON public.invoices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their invoices"
ON public.invoices FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- INVOICE LINE ITEMS
-- =============================================
CREATE TABLE public.invoice_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invoice items"
ON public.invoice_line_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.organizations o ON i.organization_id = o.id
    WHERE i.id = invoice_id AND o.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their invoice items"
ON public.invoice_line_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.organizations o ON i.organization_id = o.id
    WHERE i.id = invoice_id AND o.owner_id = auth.uid()
  )
);

-- =============================================
-- EXPENSES
-- =============================================
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  category TEXT,
  vendor TEXT,
  description TEXT,
  receipt_url TEXT,
  status expense_status NOT NULL DEFAULT 'pending',
  needs_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org expenses"
ON public.expenses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Users can create expenses"
ON public.expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
ON public.expenses FOR UPDATE
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.organizations 
  WHERE id = organization_id AND owner_id = auth.uid()
));

-- =============================================
-- CREDIT PRE-QUALIFICATION
-- =============================================
CREATE TABLE public.credit_prequalifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  status credit_status NOT NULL DEFAULT 'not_eligible',
  max_eligible_amount NUMERIC,
  eligibility_reason TEXT,
  assessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.credit_prequalifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their credit prequal"
ON public.credit_prequalifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- CREDIT REQUESTS
-- =============================================
CREATE TABLE public.credit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  requested_amount NUMERIC NOT NULL,
  purpose TEXT,
  repayment_preference TEXT,
  status credit_status NOT NULL DEFAULT 'applied',
  approved_amount NUMERIC,
  interest_rate NUMERIC,
  term_months INTEGER,
  decision_note TEXT,
  decided_at TIMESTAMP WITH TIME ZONE,
  decided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their credit requests"
ON public.credit_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create credit requests"
ON public.credit_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- AUDIT LOG
-- =============================================
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org audit logs"
ON public.audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyb_applications_updated_at BEFORE UPDATE ON public.kyb_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_card_controls_updated_at BEFORE UPDATE ON public.card_controls
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_requests_updated_at BEFORE UPDATE ON public.credit_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();