import {
	Navbar,
	Hero,
	CoreFeatures,
	BusinessPartners,
	Testimonials,
	PricingHorizonCards,
	DemoSlider,
	Footer,
} from "@/components";

const Home = () => {
	return (
		<>
			<Navbar />
			<Hero />
			<CoreFeatures />
			<BusinessPartners />
			<Testimonials />
			<PricingHorizonCards />
			<DemoSlider />
			<Footer />
		</>
	);
};

export default Home;
