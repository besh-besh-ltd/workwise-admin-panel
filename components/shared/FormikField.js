import { Field } from "formik";
import React from "react";

const FormikField = ({
	label,
	isRequired,
	name,
	touched,
	type = "text",
	errors,
	selectOptions = [],
	nolabel = false,
	rows = 2,
	cols = 2,
	className = "",
}) => {
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
						placeholder={`Enter ${label}`}
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
						placeholder={label ? `Enter ${label}` : ""}
						cols={cols}
						rows={rows}
						className={className}
					/>
				) : (
					<Field
						type={`${type}`}
						id={`${name}`}
						name={`${name}`}
						placeholder={`Enter ${label}`}
					/>
				)}

				{touched[name] && errors[name] && (
					<div className="form-error">{errors[name]}</div>
				)}
			</div>
		</>
	);
};

export default FormikField;
