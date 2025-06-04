import { notFound } from 'next/navigation';
import styles from './page.module.css';

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
		<div className={styles.homeContainer}>
			<Hero />
			<CoreFeatures />
			<BusinessPartners />
			<Testimonials />
			<PricingHorizonCards />
			<DemoSlider />
		</div>
	);
};

export default Home;
