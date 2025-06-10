"use client";

import Tickets from "./tickets";

const ResolvedTickets = () => {
	return (
		<Tickets
			title="Resolved Tickets"
			filter={{
				status: "resolved",
			}}
		/>
	);
};

export default ResolvedTickets; 