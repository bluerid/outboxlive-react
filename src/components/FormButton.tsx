import React from 'react';

type FormButtonProps = {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'submit' | 'button' | 'reset';
};

const FormButton: React.FC<FormButtonProps> = ({
    children,
    onClick,
    disabled = false,
    loading = false,
    type = 'button',
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="btn btn-primary"
        >
            {loading ? 'Logging in...' : children}
        </button>
    );
};

export default FormButton;