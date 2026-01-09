-- Create enums for onboarding
CREATE TYPE public.onboarding_status AS ENUM ('draft', 'submitted', 'in_review', 'needs_info', 'approved', 'not_approved');
CREATE TYPE public.entity_type AS ENUM ('dubai_single_owner_uae_resident');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.prefill_source AS ENUM ('registry_lookup', 'manual_entry');
CREATE TYPE public.person_role AS ENUM ('owner', 'director', 'authorized_signatory');
CREATE TYPE public.account_use_purpose AS ENUM ('invoice_clients', 'pay_suppliers', 'both');
CREATE TYPE public.volume_band AS ENUM ('0_50k', '50_200k', '200k_plus');
CREATE TYPE public.customer_location AS ENUM ('uae', 'gcc', 'international');
CREATE TYPE public.pep_status AS ENUM ('no', 'yes', 'unsure');
CREATE TYPE public.onboarding_doc_type AS ENUM ('trade_license', 'moa_aoa', 'emirates_id_front', 'emirates_id_back', 'passport', 'proof_of_address');
CREATE TYPE public.onboarding_doc_status AS ENUM ('missing', 'uploaded', 'validating', 'accepted', 'rejected');
CREATE TYPE public.rejection_reason AS ENUM ('expired', 'unreadable', 'mismatch_name', 'missing_pages', 'other');
CREATE TYPE public.event_actor AS ENUM ('user', 'system');

-- 1. Onboarding Cases table
CREATE TABLE public.onboarding_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status public.onboarding_status NOT NULL DEFAULT 'draft',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  entity_type public.entity_type NOT NULL DEFAULT 'dubai_single_owner_uae_resident',
  sla_text TEXT DEFAULT 'Typically 1-2 business days',
  risk_level public.risk_level NOT NULL DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Company Profiles table
CREATE TABLE public.company_profiles (
  case_id UUID PRIMARY KEY REFERENCES public.onboarding_cases(id) ON DELETE CASCADE,
  trade_license_number TEXT,
  issuing_authority TEXT,
  company_legal_name TEXT,
  legal_form TEXT,
  registered_address TEXT,
  business_activity TEXT,
  operating_address TEXT,
  website TEXT,
  prefill_source public.prefill_source,
  confirmed_by_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Onboarding Persons table
CREATE TABLE public.onboarding_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.onboarding_cases(id) ON DELETE CASCADE,
  full_name TEXT,
  dob DATE,
  nationality TEXT,
  roles public.person_role[] NOT NULL DEFAULT '{}',
  ownership_percent NUMERIC DEFAULT 100,
  email TEXT,
  phone TEXT,
  is_uae_resident BOOLEAN NOT NULL DEFAULT true,
  emirates_id_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Compliance Answers table
CREATE TABLE public.compliance_answers (
  case_id UUID PRIMARY KEY REFERENCES public.onboarding_cases(id) ON DELETE CASCADE,
  account_use_purpose public.account_use_purpose,
  expected_monthly_volume_band public.volume_band,
  customer_location public.customer_location,
  cash_activity BOOLEAN,
  pep_confirmation public.pep_status,
  other_controllers BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Onboarding Documents table
CREATE TABLE public.onboarding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.onboarding_cases(id) ON DELETE CASCADE,
  document_type public.onboarding_doc_type NOT NULL,
  owner_person_id UUID REFERENCES public.onboarding_persons(id) ON DELETE SET NULL,
  status public.onboarding_doc_status NOT NULL DEFAULT 'missing',
  file_url TEXT,
  file_name TEXT,
  expiry_date DATE,
  validation_notes TEXT,
  rejection_reason_code public.rejection_reason,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Onboarding Events (audit trail)
CREATE TABLE public.onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.onboarding_cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor public.event_actor NOT NULL DEFAULT 'user',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.onboarding_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_cases
CREATE POLICY "Users can view their own cases"
  ON public.onboarding_cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cases"
  ON public.onboarding_cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases"
  ON public.onboarding_cases FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for company_profiles
CREATE POLICY "Users can view their company profiles"
  ON public.company_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = company_profiles.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their company profiles"
  ON public.company_profiles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = company_profiles.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their company profiles"
  ON public.company_profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = company_profiles.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

-- RLS Policies for onboarding_persons
CREATE POLICY "Users can view their onboarding persons"
  ON public.onboarding_persons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = onboarding_persons.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can create onboarding persons"
  ON public.onboarding_persons FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = onboarding_persons.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their onboarding persons"
  ON public.onboarding_persons FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = onboarding_persons.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

-- RLS Policies for compliance_answers
CREATE POLICY "Users can view their compliance answers"
  ON public.compliance_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = compliance_answers.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their compliance answers"
  ON public.compliance_answers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = compliance_answers.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their compliance answers"
  ON public.compliance_answers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = compliance_answers.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

-- RLS Policies for onboarding_documents
CREATE POLICY "Users can view their onboarding documents"
  ON public.onboarding_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = onboarding_documents.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can create onboarding documents"
  ON public.onboarding_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = onboarding_documents.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their onboarding documents"
  ON public.onboarding_documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = onboarding_documents.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

-- RLS Policies for onboarding_events
CREATE POLICY "Users can view their onboarding events"
  ON public.onboarding_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = onboarding_events.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can create onboarding events"
  ON public.onboarding_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.onboarding_cases
    WHERE onboarding_cases.id = onboarding_events.case_id
    AND onboarding_cases.user_id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_onboarding_cases_updated_at
  BEFORE UPDATE ON public.onboarding_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_persons_updated_at
  BEFORE UPDATE ON public.onboarding_persons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_answers_updated_at
  BEFORE UPDATE ON public.compliance_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_documents_updated_at
  BEFORE UPDATE ON public.onboarding_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for onboarding documents
INSERT INTO storage.buckets (id, name, public) VALUES ('onboarding-documents', 'onboarding-documents', false);

-- Storage policies for onboarding documents bucket
CREATE POLICY "Users can upload onboarding documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'onboarding-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their onboarding documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'onboarding-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their onboarding documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'onboarding-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their onboarding documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'onboarding-documents' AND auth.uid()::text = (storage.foldername(name))[1]);