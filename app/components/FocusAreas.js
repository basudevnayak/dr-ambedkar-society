export default function FocusAreas() {
  const focusAreas = [
    {
      id: 1,
      href: "#women",
      icon: "fa-female",
      title: "Women Empowerment",
      description: "Promoting gender equality through education, skill development, and economic opportunities.",
      gradient: "from-pink-50 to-white dark:from-pink-900/30 dark:to-gray-800",
      border: "border-pink-100 dark:border-pink-900/50",
      iconBg: "bg-pink-100 dark:bg-pink-900/30",
      iconColor: "text-pink-600 dark:text-pink-400"
    },
    {
      id: 2,
      href: "#child",
      icon: "fa-child",
      title: "Child Welfare",
      description: "Ensuring children's rights, nutrition, education, and protection from exploitation.",
      gradient: "from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800",
      border: "border-blue-100 dark:border-blue-900/50",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: 3,
      href: "#education",
      icon: "fa-graduation-cap",
      title: "Education",
      description: "Providing access to quality education, scholarships, and learning resources.",
      gradient: "from-amber-50 to-white dark:from-amber-900/30 dark:to-gray-800",
      border: "border-amber-100 dark:border-amber-900/50",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      id: 4,
      href: "#health",
      icon: "fa-heartbeat",
      title: "Health & Nutrition",
      description: "Improving community health through medical camps, awareness, and nutrition programs.",
      gradient: "from-emerald-50 to-white dark:from-emerald-900/30 dark:to-gray-800",
      border: "border-emerald-100 dark:border-emerald-900/50",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    }
  ];

  return (
    <section id="focus" className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Our Focus Areas</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">We work across multiple domains to create sustainable impact in communities through targeted initiatives and programs.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {focusAreas.map((area) => (
            <a 
              key={area.id}
              href={area.href}
              className={`focus-card bg-gradient-to-br ${area.gradient} ${area.border} rounded-xl p-6 shadow-sm dark:shadow-gray-900`}
            >
              <div className={`${area.iconBg} ${area.iconColor} w-14 h-14 rounded-full flex items-center justify-center mb-5`}>
                <i className={`fas ${area.icon} text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{area.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{area.description}</p>
            </a>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <a href="#focus" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300">
            View All Focus Areas <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}