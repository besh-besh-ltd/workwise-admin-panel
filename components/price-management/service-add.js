import React from "react";

const ServiceAdd = () => {
	return (
		<div className="container">
			<div className="d-flex justify-content-between p-4">
				<h3>Create Add-on Service</h3>
			</div>
			<div className="card col-12">
				<div className="card-body mt-3">
					<form>
						<div className="form-group row">
							<label for="inputEmail3" className="col-sm-2 col-form-label">
								Service Name
							</label>
							<div className="col-sm-4">
								<input
									type="text"
									className="form-control"
									id="inputEmail3"
									placeholder="Platinum"
								/>
							</div>
						</div>
						<div className="form-group row">
							<label for="inputEmail3" className="col-sm-2 col-form-label">
								Description
							</label>
							<div className="col-sm-4">
								<textarea
									className="form-control"
									id="inputEmail3"
									rows="3"
								></textarea>
							</div>
						</div>
						<div className="form-group row">
							<label for="inputEmail3" className="col-sm-2 col-form-label">
								Target User Type
							</label>
							<div className="col-sm-4">
								<select className="form-select" id="inputEmail3" rows="3">
									<option>Choose target user</option>
								</select>
							</div>
						</div>
						<div className="form-group row">
							<label for="inputEmail3" className="col-sm-2 col-form-label">
								Subscription Fees
							</label>
							<div className="col-sm-2">
								<input
									type="text"
									className="form-control"
									id="inputEmail3"
									placeholder="₹"
								/>
							</div>
							<label for="inputEmail3" className="col-sm-2 col-form-label">
								to be charged
							</label>
							<div className="col-sm-3">
								<select type="text" className="form-select" id="inputEmail3">
									<option>Weekly</option>
									<option>Monthly</option>
									<option>Yearly</option>
								</select>
							</div>
						</div>
						<div className="d-flex float-right">
							<button type="submit" className="btn btn-primary justify">
								Save
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ServiceAdd;
