import { AdministrativeDivisionFields } from '@/modules/address/components/AdministrativeDivisionFields';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const mockProvinces = {
  isPending: false,
  error: null,
  data: {
    statusCode: 200 as const,
    message: 'OK',
    data: [
      { code: '01', name: 'Thành phố Hà Nội', type: 'thanh-pho-trung-uong' },
      {
        code: '79',
        name: 'Thành phố Hồ Chí Minh',
        type: 'thanh-pho-trung-uong',
      },
      { code: '48', name: 'Thành phố Đà Nẵng', type: 'thanh-pho-trung-uong' },
      { code: '31', name: 'Thành phố Hải Phòng', type: 'thanh-pho-trung-uong' },
    ],
  },
};

const mockWards = {
  isPending: false,
  error: null,
  data: {
    statusCode: 200 as const,
    message: 'OK',
    data: [],
  },
};

describe('AdministrativeDivisionFields', () => {
  it('filters province list when user types search text', async () => {
    const user = userEvent.setup();
    const onProvinceChange = vi.fn();
    const onWardChange = vi.fn();

    render(
      <AdministrativeDivisionFields
        provinceCode=""
        wardCode=""
        onProvinceChange={onProvinceChange}
        onWardChange={onWardChange}
        provinces={mockProvinces}
        wards={mockWards}
      />,
    );

    const input = screen.getByPlaceholderText(
      'Type to search province or city…',
    );

    // Open combobox by clicking input
    await user.click(input);

    // Initial popup should display items
    expect(screen.getByText('Thành phố Hà Nội')).toBeInTheDocument();
    expect(screen.getByText('Thành phố Hồ Chí Minh')).toBeInTheDocument();

    // Type "Da Nang" or "Đà Nẵng" without accents
    await user.type(input, 'Da Nang');

    // Only "Thành phố Đà Nẵng" should match
    expect(screen.getByText('Thành phố Đà Nẵng')).toBeInTheDocument();
    expect(screen.queryByText('Thành phố Hà Nội')).not.toBeInTheDocument();
    expect(screen.queryByText('Thành phố Hồ Chí Minh')).not.toBeInTheDocument();
  });

  it('formats raw regex pattern errors into user-friendly messages', () => {
    render(
      <AdministrativeDivisionFields
        provinceCode="01"
        wardCode=""
        onProvinceChange={vi.fn()}
        onWardChange={vi.fn()}
        provinces={mockProvinces}
        wards={mockWards}
        errors={{
          wardCode: 'Invalid string: must match pattern /^\\d{5}$/',
          provinceCode: 'Invalid string: must match pattern /^\\d{2}$/',
        }}
      />,
    );

    expect(
      screen.getByText('Please select a valid ward or commune'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Please select a valid province or city'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Invalid string: must match pattern /^\\d{5}$/'),
    ).not.toBeInTheDocument();
  });
});
