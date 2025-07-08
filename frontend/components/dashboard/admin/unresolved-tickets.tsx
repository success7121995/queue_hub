"use client";

import Tickets from "./tickets";

const UnresolvedTickets = () => {
	return (
		<Tickets
			title="Unresolved Tickets"
			filter={{
				status: ["OPEN", "IN_PROGRESS"],
			}}
		/>
	);
};

export default UnresolvedTickets; 