import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "aibnk_onboarding_data";
const SYNC_EVENT = "aibnk_onboarding_sync";
// Hook version - forces rebuild on HMR issues

export interface LocalOnboardingData {
  // Company
  company: {
    issuing_authority: string;
    trade_license_number: string;
    company_legal_name: string;
    legal_form: string;
    registered_address: string;
    business_activity: string;
    operating_address?: string;
    website?: string;
    prefill_source: "registry_lookup" | "manual_entry" | null;
    confirmed_by_user: boolean;
  };
  // Owner
  owner: {
    full_name: string;
    dob: string;
    nationality: string;
    email?: string;
    phone?: string;
    emirates_id_number?: string;
    roles: string[];
    ownership_percent: number;
    is_uae_resident: boolean;
  };
  // Compliance
  compliance: {
    account_use_purpose: string;
    expected_monthly_volume_band: string;
    customer_location: string;
    cash_activity: boolean;
    pep_confirmation: string;
    other_controllers: boolean;
  };
  // Documents (file references stored as base64 or URLs)
  documents: {
    [key: string]: {
      file_name: string;
      file_data: string; // base64
      status: "uploaded" | "validating" | "accepted" | "rejected";
      uploaded_at: string;
    };
  };
  // Meta
  submitted: boolean;
  documentsSkipped: boolean;
  created_at: string;
}

const getDefaultData = (): LocalOnboardingData => ({
  company: {
    issuing_authority: "",
    trade_license_number: "",
    company_legal_name: "",
    legal_form: "",
    registered_address: "",
    business_activity: "",
    prefill_source: null,
    confirmed_by_user: false,
  },
  owner: {
    full_name: "",
    dob: "",
    nationality: "",
    roles: ["owner", "director", "authorized_signatory"],
    ownership_percent: 100,
    is_uae_resident: true,
  },
  compliance: {
    account_use_purpose: "",
    expected_monthly_volume_band: "",
    customer_location: "",
    cash_activity: false,
    pep_confirmation: "",
    other_controllers: false,
  },
  documents: {},
  submitted: false,
  documentsSkipped: false,
  created_at: new Date().toISOString(),
});

export function useLocalOnboarding() {
  const [data, setData] = useState<LocalOnboardingData>(getDefaultData);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(getDefaultData());
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for sync events from other hook instances
  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch {
          // ignore parse errors
        }
      }
    };

    // Listen for custom sync event (same window)
    window.addEventListener(SYNC_EVENT, handleSync);
    // Listen for storage event (cross-tab)
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) handleSync();
    });

    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
    };
  }, []);

  // Save to localStorage and notify other hook instances
  const saveData = useCallback((newData: LocalOnboardingData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    // Notify other hook instances in the same window
    window.dispatchEvent(new Event(SYNC_EVENT));
  }, []);

  const updateCompany = useCallback((company: Partial<LocalOnboardingData["company"]>) => {
    saveData({ ...data, company: { ...data.company, ...company } });
  }, [data, saveData]);

  const updateOwner = useCallback((owner: Partial<LocalOnboardingData["owner"]>) => {
    saveData({ ...data, owner: { ...data.owner, ...owner } });
  }, [data, saveData]);

  const updateCompliance = useCallback((compliance: Partial<LocalOnboardingData["compliance"]>) => {
    saveData({ ...data, compliance: { ...data.compliance, ...compliance } });
  }, [data, saveData]);

  const addDocument = useCallback((docType: string, fileName: string, fileData: string) => {
    const newDocs = {
      ...data.documents,
      [docType]: {
        file_name: fileName,
        file_data: fileData,
        status: "uploaded" as const,
        uploaded_at: new Date().toISOString(),
      },
    };
    saveData({ ...data, documents: newDocs });
    
    // Simulate validation - after 1s set to validating, after 2s set to accepted
    setTimeout(() => {
      const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (currentData.documents?.[docType]) {
        currentData.documents[docType].status = "validating";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
        setData(currentData);
        window.dispatchEvent(new Event(SYNC_EVENT));
      }
    }, 1000);

    setTimeout(() => {
      const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (currentData.documents?.[docType]) {
        currentData.documents[docType].status = "accepted";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
        setData(currentData);
        window.dispatchEvent(new Event(SYNC_EVENT));
      }
    }, 3000);
  }, [data, saveData]);

  const markSubmitted = useCallback(() => {
    saveData({ ...data, submitted: true });
  }, [data, saveData]);

  const skipDocuments = useCallback(() => {
    saveData({ ...data, documentsSkipped: true });
  }, [data, saveData]);

  const clearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(getDefaultData());
  }, []);

  const hasData = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }, []);

  // Calculate progress
  const calculateProgress = useCallback(() => {
    let progress = 0;
    
    // Company: 20%
    if (data.company.confirmed_by_user) {
      progress += 20;
    }
    
    // Owner: 20%
    if (data.owner.full_name && data.owner.dob && data.owner.nationality) {
      progress += 20;
    }
    
    // Compliance: 20%
    if (
      data.compliance.account_use_purpose &&
      data.compliance.expected_monthly_volume_band &&
      data.compliance.customer_location &&
      data.compliance.pep_confirmation
    ) {
      progress += 20;
    }
    
    // Documents: 40% (8% each for 5 required docs)
    const requiredDocs = ["trade_license", "moa_aoa", "emirates_id_front", "emirates_id_back", "passport"];
    requiredDocs.forEach((doc) => {
      if (data.documents[doc]?.status === "accepted") {
        progress += 8;
      }
    });
    
    return Math.min(progress, 100);
  }, [data]);

  return {
    data,
    isLoading,
    updateCompany,
    updateOwner,
    updateCompliance,
    addDocument,
    markSubmitted,
    skipDocuments,
    clearData,
    hasData,
    progress: calculateProgress(),
  };
}

// Static helper to get data (for SignUp page)
export function getLocalOnboardingData(): LocalOnboardingData | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function clearLocalOnboardingData() {
  localStorage.removeItem(STORAGE_KEY);
}
