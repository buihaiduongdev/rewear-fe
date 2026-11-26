'use client';

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  type BankAccountValidationErrors,
  createShopBankAccount,
  validateBankAccountFields,
} from '@/modules/shop/api/shop-bank-accounts';
import { uploadShopLogo } from '@/modules/shop/api/shop-logo';
import {
  shopMembershipsQueryKey,
  useShopMemberships,
} from '@/modules/shop/hooks/use-shop-memberships';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useShopControllerCreate } from '@/shared/api/query-generated/shops/shops';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function useOpenShop() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const shopNameInputId = useId();
  const shopAboutInputId = useId();
  const bankCodeInputId = useId();
  const accountNumberInputId = useId();
  const accountNameInputId = useId();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [bankErrors, setBankErrors] = useState<BankAccountValidationErrors>({});
  const [bankSaved, setBankSaved] = useState(false);
  const [stepError, setStepError] = useState('');

  const [copied, setCopied] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoError, setLogoError] = useState('');
  const [createdShopId, setCreatedShopId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setLogoError('');
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(
        file.type,
      ) ||
      file.size <= 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      removeLogo();
      setLogoError('Choose a JPG, PNG, WebP or AVIF image up to 5 MB.');
      return;
    }
    setLogoError('');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const isAuthenticated = status === 'authenticated' && !session?.error;

  const memberships = useShopMemberships(isAuthenticated, session?.user.id);

  const existingShop = useMemo(() => {
    return memberships.data?.data.find(
      (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
    );
  }, [memberships.data?.data]);

  const createShop = useShopControllerCreate();

  const slug = useMemo(() => {
    const raw = name.trim() || 'your-shop';
    return slugify(raw);
  }, [name]);

  const initials = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return 'HA';
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }, [name]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`rewear.vn/shops/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    if (!bankSaved) {
      const validationErrors = validateBankAccountFields({
        bankCode,
        accountNumber,
        accountName,
        ownerConfirmed,
      });
      setBankErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }

    setSubmitting(true);
    setLogoError('');
    setStepError('');

    let id = createdShopId;
    let isBankSaved = bankSaved;
    try {
      if (!id) {
        const result = await createShop.mutateAsync({
          data: { name: name.trim(), description: description.trim() || null },
        });
        id = result.data.id;
        setCreatedShopId(id);
      }

      if (!isBankSaved) {
        await createShopBankAccount(id, {
          bankCode: bankCode.trim().toUpperCase(),
          accountNumber: accountNumber.replace(/\s+/g, ''),
          accountName: accountName.trim(),
          ownerConfirmed: true,
          isDefault: true,
        });
        isBankSaved = true;
        setBankSaved(true);
      }

      if (logoFile) {
        await uploadShopLogo(id, logoFile);
      }

      await queryClient.invalidateQueries({
        queryKey: shopMembershipsQueryKey,
      });
      router.push(
        `/selling/pickup?shopId=${encodeURIComponent(id)}&onboarding=true`,
      );
    } catch (error) {
      if (id && !isBankSaved) {
        setStepError(
          `Your shop was created, but your payout bank account could not be saved. ${getApiErrorMessage(error)} Fix the bank details and submit again.`,
        );
      } else if (id) {
        setLogoError(
          `Your shop was created, but the logo could not be uploaded. ${getApiErrorMessage(error)} You can retry or remove the logo to continue.`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    shopNameInputId,
    shopAboutInputId,
    bankCodeInputId,
    accountNumberInputId,
    accountNameInputId,
    name,
    setName,
    description,
    setDescription,
    bankCode,
    setBankCode: (value: string) => {
      setBankCode(value);
      if (bankErrors.bankCode)
        setBankErrors((prev) => ({ ...prev, bankCode: undefined }));
    },
    accountNumber,
    setAccountNumber: (value: string) => {
      setAccountNumber(value);
      if (bankErrors.accountNumber)
        setBankErrors((prev) => ({ ...prev, accountNumber: undefined }));
    },
    accountName,
    setAccountName: (value: string) => {
      setAccountName(value);
      if (bankErrors.accountName)
        setBankErrors((prev) => ({ ...prev, accountName: undefined }));
    },
    ownerConfirmed,
    setOwnerConfirmed: (value: boolean) => {
      setOwnerConfirmed(value);
      if (bankErrors.ownerConfirmed)
        setBankErrors((prev) => ({ ...prev, ownerConfirmed: undefined }));
    },
    bankErrors,
    bankSaved,
    stepError,
    copied,
    logoPreview,
    logoFile,
    logoError,
    removeLogo,
    handleLogoChange,
    createdShopId,
    submitting,
    isAuthenticated,
    memberships,
    existingShop,
    createShop,
    slug,
    initials,
    handleCopyUrl,
    handleSubmit,
  };
}
