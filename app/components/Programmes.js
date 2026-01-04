export default function Programmes() {
  const programmes = [
    {
      id: 1,
      title: "Matri Bandana",
      description: "A tribute to motherhood program that supports expecting and new mothers with healthcare and nutrition.",
      icon: "fa-hand-holding-heart",
      iconColor: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    },
    {
      id: 2,
      title: "Blood Donation Camp",
      description: "Regular blood donation drives organized in collaboration with hospitals and medical institutions.",
      icon: "fa-tint",
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-200 dark:bg-red-800/30"
    },
    {
      id: 3,
      title: "Tree Plantation",
      description: "Environmental conservation through large-scale tree plantation drives and awareness campaigns.",
      icon: "fa-tree",
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    }
  ];

  return (
    <section id="programmes" className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Our Programmes</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">We run various programs throughout the year to address community needs and create positive social impact.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programmes.map((program) => (
            <div key={program.id} className="program-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg dark:shadow-gray-900">
              <div className={`h-48 ${program.bgColor} flex items-center justify-center`}>
                <i className={`fas ${program.icon} ${program.iconColor} text-6xl`}></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{program.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-5">{program.description}</p>
                <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300">
                  Learn More <i className="fas fa-arrow-right ml-1"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}