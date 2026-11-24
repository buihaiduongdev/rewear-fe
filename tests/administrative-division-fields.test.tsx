import { AdministrativeDivisionFields } from '@/modules/address/components/AdministrativeDivisionFields';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mockProvinces = {
  isPending: false,
  error: null,
  data: {
    data: [
      { id: 201, name: 'Hà Nội' },
      { id: 202, name: 'Hồ Chí Minh' },
      { id: 203, name: 'Đà Nẵng' },
      { id: 204, name: 'Hải Phòng' },
    ],
  },
};

const mockDistricts = {
  isPending: false,
  error: null,
  data: {
    data: [],
  },
};

const mockWards = {
  isPending: false,
  error: null,
  data: {
    data: [],
  },
};

describe('AdministrativeDivisionFields', () => {
  it('filters province list when user types search text', async () => {
    const user = userEvent.setup();
    const onProvinceChange = vi.fn();
    const onDistrictChange = vi.fn();
    const onWardChange = vi.fn();

    render(
      <AdministrativeDivisionFields
        provinceId=""
        districtId=""
        wardCode=""
        onProvinceChange={onProvinceChange}
        onDistrictChange={onDistrictChange}
        onWardChange={onWardChange}
        provinces={mockProvinces}
        districts={mockDistricts}
        wards={mockWards}
      />,
    );

    const input = screen.getByPlaceholderText(
      'Type to search province or city…',
    );

    // Open combobox by clicking input
    await user.click(input);

    // Initial popup should display items
    expect(screen.getByText('Hà Nội')).toBeInTheDocument();
    expect(screen.getByText('Hồ Chí Minh')).toBeInTheDocument();

    // Type "Da Nang" or "Đà Nẵng" without accents
    await user.type(input, 'Da Nang');

    // Only "Đà Nẵng" should match
    expect(screen.getByText('Đà Nẵng')).toBeInTheDocument();
    expect(screen.queryByText('Hà Nội')).not.toBeInTheDocument();
    expect(screen.queryByText('Hồ Chí Minh')).not.toBeInTheDocument();
  });

  it('renders errors properly', () => {
    render(
      <AdministrativeDivisionFields
        provinceId={201}
        districtId=""
        wardCode=""
        onProvinceChange={vi.fn()}
        onDistrictChange={vi.fn()}
        onWardChange={vi.fn()}
        provinces={mockProvinces}
        districts={mockDistricts}
        wards={mockWards}
        errors={{
          wardCode: 'Please select a ward',
          districtId: 'Please select a district',
        }}
      />,
    );

    expect(screen.getByText('Please select a ward')).toBeInTheDocument();
    expect(screen.getByText('Please select a district')).toBeInTheDocument();
  });
});
