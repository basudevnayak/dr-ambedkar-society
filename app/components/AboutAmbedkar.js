export default function AboutAmbedkar() {
  return (
    <section id="ambedkar" className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/3 mb-10 lg:mb-0">
            <div className="bg-gradient-to-br from-blue-100 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-xl p-8 shadow-lg dark:shadow-gray-900">
              <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-8 border-white dark:border-gray-700 shadow-lg">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Dr._Bhimrao_Ambedkar.jpg/800px-Dr._Bhimrao_Ambedkar.jpg" 
                  alt="Dr. B.R. Ambedkar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-center mt-6 text-gray-800 dark:text-white">Dr. B.R. Ambedkar</h3>
              <p className="text-center text-gray-600 dark:text-gray-400 mt-2">Father of the Indian Constitution</p>
            </div>
          </div>
          
          <div className="lg:w-2/3 lg:pl-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">Who is Dr. B.R. Ambedkar?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-5">Dr. Bhimrao Ramji Ambedkar (1891-1956) was an Indian jurist, economist, social reformer and political leader who headed the committee drafting the Constitution of India from the Constituent Assembly debates. He was also the first Law and Justice Minister of independent India.</p>
            <p className="text-gray-700 dark:text-gray-300 mb-5">Dr. Ambedkar campaigned against social discrimination towards the untouchables (Dalits), and supported the rights of women and workers. He is known as the father of the Indian Constitution and is revered by millions as a symbol of social justice and equality.</p>
            <p className="text-gray-700 dark:text-gray-300 mb-8">Our society is inspired by his vision of social equality, justice, and empowerment for all sections of society, particularly the marginalized and underprivileged.</p>
            <a href="#about" className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300">
              Learn About Our History <i className="fas fa-arrow-right ml-2"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}