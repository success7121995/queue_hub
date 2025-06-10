"use client";

import Tickets from "./tickets";

const AssignedTickets = () => {
	// In a real app, we would get the current admin's ID from the auth context
	const currentAdminId = "ADMIN-001";

	return (
		<Tickets
			title="My Assigned Tickets"
			filter={{
				assignedTo: currentAdminId,
			}}
		/>
	);
};

export default AssignedTickets; 