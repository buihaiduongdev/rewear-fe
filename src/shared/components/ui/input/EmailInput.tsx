import { BaseInputField, type BaseInputFieldProps } from './BaseInputField';

export type TEmailInputProps = Omit<BaseInputFieldProps, 'label' | 'type'>;

export function EmailInput({ error, ...props }: TEmailInputProps) {
  return (
    <BaseInputField
      {...props}
      id={props.id ?? 'email'}
      type="email"
      label="Email"
      error={error}
      placeholder={props.placeholder ?? 'Enter your email'}
    />
  );
}
