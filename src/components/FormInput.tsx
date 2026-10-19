import React from 'react';

type FormInputProps = {
    type: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
};

const FormInput: React.FC<FormInputProps> = ({
    type,
    label,
    value,
    onChange,
    required = false,
    disabled = false,
    placeholder = '',
}) => {
    return (
        <div className="form-group">
            <label htmlFor={label.toLowerCase()} className="form-label">
                {label}:
            </label>
            <input
                type={type}
                id={label.toLowerCase()}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                className="form-input"
            />
        </div>
    );
};

export default FormInput;