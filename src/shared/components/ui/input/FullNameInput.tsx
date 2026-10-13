import { BaseInputField, type BaseInputFieldProps } from './BaseInputField';

export type TFullNameInputProps = Omit<BaseInputFieldProps, 'label' | 'type'>;

export function FullNameInput({ error, ...props }: TFullNameInputProps) {
  return (
    <BaseInputField
      {...props}
      id={props.id ?? 'fullName'}
      type="text"
      label="Full name"
      error={error}
      placeholder="Enter your name"
    />
  );
}
