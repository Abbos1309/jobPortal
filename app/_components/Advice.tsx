'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'

function Advice() {
    // Parent container variant to handle staggered arrivals smoothly
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                // Changing this from 1 to 0.15 makes the waterfall effect snappy and modern
                staggerChildren: 0.15
            }
        }
    }

    




    // Individual card variant - drops DOWN subtly from -20px instead of a harsh -50px
    const cardVariants:Variants = {
        hidden: {
            opacity: 0,
            y: -20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100, // Slightly snappier spring
                damping: 15     // Smooths out the bounce
            }
        }
    }

    const features = [
        { icon: "🔍", title: "Powerful Search", desc: "Advanced filtering by job title, category, and more. Find exactly what you're looking for in seconds." },
        { icon: "⭐", title: "Curated Opportunities", desc: "Carefully selected job postings from verified companies across industries and experience levels." },
        { icon: "✨", title: "User-Friendly Interface", desc: "Intuitive design makes job hunting simple and enjoyable. Browse, filter, and explore with ease." },
        { icon: "⚡", title: "Real-Time Updates", desc: "Instant notifications for new job postings. Never miss an opportunity that matches your profile." }
    ]

    return (
        <div className="bg-[#f8f8ef] min-h-screen py-40 px-6 font-sans antialiased">
            <div className="mx-auto max-w-5xl">

                {/* Headers slide down when scrolled into view */}
                <motion.p
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }} // Triggers a bit earlier
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className='text-[55px] font-bold text-center leading-tight mb-4 text-slate-950'
                >
                    Why Choose Job Portal?
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: -15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                    className='text-center mb-20 text-gray-600 text-[20px] max-w-2xl mx-auto'
                >
                    We've designed the most intuitive job search platform to help you find opportunities that align with your career goals.
                </motion.p>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants} 
                            whileHover={{
                                y: -6,
                                scale: 1.01,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.99 }}
                            className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow duration-300 hover:shadow-lg hover:border-[#0f3473] hover:bg-[#fafbfc] cursor-pointer"
                        >
                            <div className="text-3xl mb-5">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-500 font-normal">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

export default Advice