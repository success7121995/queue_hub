"use client";

interface SuccessProps {
    form: "signup" | "add-branch" | "add-admin" | "add-employee";
    countdown: number;
}

const Success: React.FC<SuccessProps> = ({ form, countdown }) => {
    const renderContent = () => {
        switch (form) {
            case "signup":
                return (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-2 text-primary-light">Signup Complete!</h2>
                        <p className="text-gray-600 text-center mb-8 text-base max-w-md">Thank you for signing up to QueueHub. Your application is currently under review. You will receive a notification via email within 72 hours regarding the outcome.</p>
                    </>
                )
            case "add-branch":
                return (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-2 text-primary-light">Branch Successfully Added!</h2>
                        <p className="text-gray-600 text-center mb-8 text-base max-w-md">Your new branch has been added and is now ready to use. Thank you for expanding your QueueHub presence</p>
                    </>
                )
            case "add-employee":
                return (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-2 text-primary-light">Employee Added Successfully!</h2>
                        <p className="text-gray-600 text-center mb-8 text-base max-w-md">The new employee has been added to your account and is ready to start using QueueHub.</p>
                    </>
                )
            case "add-admin":
                return (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-2 text-primary-light">Admin Added!</h2>
                        <p className="text-gray-600 text-center mb-8 text-base max-w-md">A new QueueHub admin has been added and will receive an email notification shortly.</p>
                    </>
                )
            default:
                return null;
        }   
    }

    return (
        <div className="w-full min-h-[60vh] flex justify-center items-center to-white py-16 font-regular-eng">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 border border-gray-100 relative flex flex-col items-center">
                {/* Success Icon */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-light/10 mb-6">
                    <svg className="w-12 h-12 text-primary-light" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 6-6" />
                    </svg>
                </div>

                {renderContent()}

                <div className="w-full flex justify-center">
                    <p className="text-gray-600 text-center mb-8 text-base max-w-md">You will be redirected to the {form === "signup" ? "home page" : "dashboard" } in {countdown} seconds.</p>
                </div>
            </div>
        </div>
    );
};

export default Success;