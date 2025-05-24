import { notFound } from 'next/navigation';

import {
	Hero,
	CoreFeatures,
	BusinessPartners,
	Testimonials,
	PricingHorizonCards,
	DemoSlider,
} from "@/components";

const Home = () => {
	const showHomePage = true;

	if (!showHomePage) {
	  notFound();
	}

	return (
		<>
			<Hero />
			<CoreFeatures />
			<BusinessPartners />
			<Testimonials />
			<PricingHorizonCards />
			<DemoSlider />
		</>
	);
};

export default Home;
