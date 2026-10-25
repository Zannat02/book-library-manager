
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { BookOpen, Leaf, Cloud, ArrowRight } from 'lucide-react';

const heading = 'Every book opens a new world.';
const greenText = 'world.';

const Banner = () => {
    const [typedText, setTypedText] = useState('');
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (shouldReduceMotion) {
            return;
        }

        let index = 0;
        let timeoutId;

        const typeNextCharacter = () => {
            index += 1;
            setTypedText(heading.slice(0, index));

            if (index < heading.length) {
                timeoutId = setTimeout(typeNextCharacter, 75);
            }
        };

        timeoutId = setTimeout(typeNextCharacter, 400);

        return () => clearTimeout(timeoutId);
    }, [shouldReduceMotion]);

    const visibleText = shouldReduceMotion ? heading : typedText;
    const greenStart = heading.length - greenText.length;
    const regularText = visibleText.slice(0, greenStart);
    const coloredText = visibleText.slice(greenStart);

    return (
        <section className="overflow-hidden">
            <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2 lg:py-24">

                {/* Banner Content */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="banner-content"
                >
                    <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#2F8F70]">
                        A little more imagination
                    </p>

                    <h1
                        aria-label={heading}
                        className="max-w-xl text-5xl leading-[1.12] font-bold tracking-tight text-[#241942] sm:text-6xl lg:text-7xl"
                    >
                        <span aria-hidden="true">
                            {regularText}
                            <span className="text-[#2F8F70]">
                                {coloredText}
                            </span>

                            <motion.span
                                aria-hidden="true"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.06em] bg-[#2F8F70] align-baseline"
                            />
                        </span>
                    </h1>

                    <p className="mt-7 max-w-lg text-base leading-8 text-gray-600 sm:text-lg">
                        Find stories that stay with you. Build your own
                        collection, explore new ideas, and make every
                        reading moment count.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-5">
                        <a
                            href="#books"
                            className="inline-flex items-center gap-3 bg-[#241942] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-[#2F8F70]"
                        >
                            Explore the library
                            <ArrowRight size={18} />
                        </a>

                       
<Link
    to="/books/add"
    className="inline-flex items-center justify-center border border-[#241942] bg-white px-6 py-4 text-sm font-semibold text-[#241942] transition duration-300 hover:border-[#2F8F70] hover:bg-[#2F8F70] hover:text-white"
>
    Add a new book
</Link>

                    </div>

                    <div className="mt-12 flex items-center gap-4 border-t border-[#241942]/10 pt-6">
                        <div className="flex -space-x-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9E3FA] text-[#241942]">
                                <BookOpen size={17} />
                            </span>

                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D6EDE2] text-[#2F8F70]">
                                <Leaf size={17} />
                            </span>
                        </div>

                        <p className="text-sm text-gray-600">
                            Your books. Your world. Your story.
                        </p>
                    </div>
                </motion.div>

            
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: 0.2,
                        ease: 'easeOut',
                    }}
                    className="banner-art relative mx-auto w-full max-w-lg"
                >
                    <div className="absolute -right-5 top-0 h-48 w-48 rounded-full bg-[#E9E3FA]/70 blur-3xl" />
                    <div className="absolute -bottom-5 left-0 h-44 w-44 rounded-full bg-[#D6EDE2]/80 blur-3xl" />

                    <div className="relative min-h-[390px] sm:min-h-[470px]">
                        <motion.div
                            whileHover={{ rotate: -6 }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-[5%] top-[13%] flex h-52 w-36 -rotate-12 flex-col justify-between bg-[#2F8F70] p-5 text-white shadow-xl sm:h-64 sm:w-44"
                        >
                            <Leaf size={27} strokeWidth={1.5} />
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                                    Grow
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    Within
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ rotate: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-1/2 top-[7%] z-10 flex h-64 w-40 -translate-x-1/2 rotate-3 flex-col justify-between bg-[#241942] p-5 text-white shadow-2xl sm:h-80 sm:w-52 sm:p-7"
                        >
                            <BookOpen size={34} strokeWidth={1.3} />

                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-[#BEB0E9]">
                                    The art of
                                </p>
                                <h2 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
                                    Getting
                                    <br />
                                    Lost
                                </h2>
                                <div className="mt-5 h-px w-12 bg-[#D6EDE2]" />
                                <p className="mt-4 text-xs text-white/60">
                                    A story of discovery
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ rotate: 6 }}
                            transition={{ duration: 0.3 }}
                            className="absolute right-[2%] top-[27%] flex h-44 w-32 rotate-12 flex-col justify-between bg-[#E9E3FA] p-4 text-[#241942] shadow-xl sm:h-56 sm:w-40 sm:p-5"
                        >
                            <Cloud size={27} strokeWidth={1.5} />
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[#65568D]">
                                    Dream
                                </p>
                                <p className="mt-2 text-xl font-semibold">
                                    Beyond
                                </p>
                            </div>
                        </motion.div>

                        <div className="absolute bottom-[4%] left-[13%] max-w-[230px] border-l-2 border-[#2F8F70] pl-4 sm:bottom-[1%]">
                            <p className="text-sm leading-6 text-gray-600">
                                “Between the pages, a whole new world waits.”
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Banner;
