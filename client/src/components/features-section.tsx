import { Shield, TrendingUp, Users } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Safe Learning Environment",
      description: "Practice dangerous or expensive experiments safely in our virtual environment without real-world risks.",
      bgColor: "bg-blue-100",
      iconColor: "text-science-blue"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed progress reports and achievement tracking for each experiment.",
      bgColor: "bg-green-100",
      iconColor: "text-lab-green"
    },
    {
      icon: Users,
      title: "Interactive Learning",
      description: "Engage with realistic simulations that respond to your actions and provide immediate feedback.",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ChemLab Virtual?</h3>
          <p className="text-xl text-lab-gray max-w-2xl mx-auto">
            Our platform provides comprehensive virtual chemistry education with real-world applications
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-lab-gray">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
