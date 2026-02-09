import { Field, FormikErrors, FormikTouched } from "formik";
import React from "react";

interface SelectOption {
	label: string;
	value: string | number;
	disabled?: boolean;
}

interface FormikFieldProps {
	label?: string;
	isRequired?: boolean;
	disabled?: boolean;
	name: string;
	touched: FormikTouched<Record<string, unknown>>;
	type?: string;
	errors: FormikErrors<Record<string, unknown>>;
	selectOptions?: SelectOption[];
	nolabel?: boolean;
	rows?: number;
	cols?: number;
	className?: string;
	placeholder?: string;
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FormikField: React.FC<FormikFieldProps> = ({
	label,
	isRequired,
	disabled,
	name,
	touched,
	type = "text",
	errors,
	selectOptions = [],
	nolabel = false,
	rows = 2,
	cols = 2,
	className = "",
	placeholder,
	onChange,
}) => {
	const defaultPlaceholder = label ? `Enter ${label}` : "";
	return (
		<>
			<div className="form-group">
				{!nolabel && (
					<label htmlFor="username">
						{label} {isRequired ? <sup>*</sup> : <>(Optional)</>}
					</label>
				)}
				{type == "select" ? (
					<Field
						as="select"
						id={`${name}`}
						name={`${name}`}
						placeholder={placeholder ?? defaultPlaceholder}
						{...(onChange && { onChange })}
						disabled={disabled}
					>
						{selectOptions?.map((item, index) => {
							return (
								<option
									key={index}
									value={item.value}
									disabled={item.disabled ? item.disabled : false}
								>
									{item.label}
								</option>
							);
						})}
					</Field>
				) : type == "textarea" ? (
					<Field
						as="textarea"
						id={`${name}`}
						name={`${name}`}
						placeholder={placeholder ?? defaultPlaceholder}
						cols={cols}
						rows={rows}
						className={className}
					/>
				) : (
					<Field
						type={`${type}`}
						id={`${name}`}
						name={`${name}`}
						placeholder={placeholder ?? defaultPlaceholder}
					/>
				)}

				{touched[name] && errors[name] && (
					<div className="form-error">{errors[name] as string}</div>
				)}
			</div>
		</>
	);
};

export default FormikField;
