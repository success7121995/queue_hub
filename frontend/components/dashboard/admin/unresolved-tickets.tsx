"use client";

import Tickets from "./tickets";

const UnresolvedTickets = () => {
	return (
		<Tickets
			title="Unresolved Tickets"
			filter={{
				status: "open",
			}}
		/>
	);
};

export default UnresolvedTickets; 