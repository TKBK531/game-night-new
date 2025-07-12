import { ArrowLeft, Calendar, Scale, Shield, AlertTriangle, FileText, Phone } from "lucide-react";
import { rulesAndRegulations } from "../../../shared/rules";

interface RulesPageProps {
    onBack?: () => void;
}

export default function RulesPage({ onBack }: RulesPageProps) {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const printRules = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-white">
            {/* Header */}
            <div className="bg-[#111823] border-b border-[#ff4654]/30 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="flex items-center text-[#ff4654] hover:text-[#ba3a46] transition-colors"
                                >
                                    <ArrowLeft className="mr-2" size={20} />
                                    Back to Registration
                                </button>
                            )}
                            <h1 className="text-2xl font-orbitron font-bold text-[#ff4654]">
                                Rules & Regulations
                            </h1>
                        </div>
                        <button
                            onClick={printRules}
                            className="flex items-center px-4 py-2 bg-[#ff4654] text-white rounded-lg hover:bg-[#ba3a46] transition-colors"
                        >
                            <FileText className="mr-2" size={16} />
                            Print Rules
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Title and Last Updated */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-[#ff4654] to-[#ba3a46] bg-clip-text text-transparent">
                        {rulesAndRegulations.title}
                    </h1>
                    <div className="flex items-center justify-center text-gray-400">
                        <Calendar className="mr-2" size={16} />
                        Last Updated: {rulesAndRegulations.lastUpdated}
                    </div>
                </div>

                {/* Table of Contents */}
                <div className="bg-[#111823] rounded-xl p-8 mb-8 gaming-border">
                    <h2 className="text-2xl font-orbitron font-bold mb-6 text-[#ff4654] flex items-center">
                        <FileText className="mr-3" />
                        Table of Contents
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <button onClick={() => scrollToSection('general')} className="text-left p-3 bg-[#1a2332] rounded-lg hover:bg-[#242d3d] transition-colors">
                            <div className="flex items-center text-[#ff4654]">
                                <Scale className="mr-2" size={16} />
                                General Rules & Regulations
                            </div>
                        </button>
                        <button onClick={() => scrollToSection('tournaments')} className="text-left p-3 bg-[#1a2332] rounded-lg hover:bg-[#242d3d] transition-colors">
                            <div className="flex items-center text-[#ba3a46]">
                                <Shield className="mr-2" size={16} />
                                Tournament Specific Rules
                            </div>
                        </button>
                        <button onClick={() => scrollToSection('penalties')} className="text-left p-3 bg-[#1a2332] rounded-lg hover:bg-[#242d3d] transition-colors">
                            <div className="flex items-center text-[#ff4654]">
                                <AlertTriangle className="mr-2" size={16} />
                                Penalties & Disqualifications
                            </div>
                        </button>
                        <button onClick={() => scrollToSection('policies')} className="text-left p-3 bg-[#1a2332] rounded-lg hover:bg-[#242d3d] transition-colors">
                            <div className="flex items-center text-[#ba3a46]">
                                <FileText className="mr-2" size={16} />
                                Event Policies
                            </div>
                        </button>
                        <button onClick={() => scrollToSection('legal')} className="text-left p-3 bg-[#1a2332] rounded-lg hover:bg-[#242d3d] transition-colors">
                            <div className="flex items-center text-[#ff4654]">
                                <Scale className="mr-2" size={16} />
                                Legal & Liability
                            </div>
                        </button>
                        <button onClick={() => scrollToSection('contact')} className="text-left p-3 bg-[#1a2332] rounded-lg hover:bg-[#242d3d] transition-colors">
                            <div className="flex items-center text-[#ba3a46]">
                                <Phone className="mr-2" size={16} />
                                Contact & Appeals
                            </div>
                        </button>
                    </div>
                </div>

                {/* General Rules */}
                <section id="general" className="mb-12">
                    <div className="bg-[#111823] rounded-xl p-8 gaming-border">
                        <h2 className="text-3xl font-orbitron font-bold mb-8 text-[#ff4654] flex items-center">
                            <Scale className="mr-3" />
                            {rulesAndRegulations.general.title}
                        </h2>
                        {rulesAndRegulations.general.rules.map((section, index) => (
                            <div key={section.id} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-[#ffffff]">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.content.map((rule, ruleIndex) => (
                                        <li key={ruleIndex} className="flex items-start text-gray-300">
                                            <span className="text-[#ff4654] mr-3 mt-1">•</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tournament Rules */}
                <section id="tournaments" className="mb-12">
                    <div className="bg-[#111823] rounded-xl p-8 gaming-border">
                        <h2 className="text-3xl font-orbitron font-bold mb-8 text-[#ba3a46] flex items-center">
                            <Shield className="mr-3" />
                            Tournament Specific Rules
                        </h2>

                        {/* Valorant Rules */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold mb-6 text-[#ff4654]">{rulesAndRegulations.tournaments.valorant.title}</h3>
                            {rulesAndRegulations.tournaments.valorant.rules.map((section, index) => (
                                <div key={section.id} className="mb-6">
                                    <h4 className="text-lg font-semibold mb-3 text-[#ffffff]">{section.title}</h4>
                                    <ul className="space-y-2">
                                        {section.content.map((rule, ruleIndex) => (
                                            <li key={ruleIndex} className="flex items-start text-gray-300">
                                                <span className="text-[#ff4654] mr-3 mt-1">•</span>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* COD Rules */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold mb-6 text-[#ba3a46]">{rulesAndRegulations.tournaments.cod.title}</h3>
                            {rulesAndRegulations.tournaments.cod.rules.map((section, index) => (
                                <div key={section.id} className="mb-6">
                                    <h4 className="text-lg font-semibold mb-3 text-[#ffffff]">{section.title}</h4>
                                    <ul className="space-y-2">
                                        {section.content.map((rule, ruleIndex) => (
                                            <li key={ruleIndex} className="flex items-start text-gray-300">
                                                <span className="text-[#ba3a46] mr-3 mt-1">•</span>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Penalties */}
                <section id="penalties" className="mb-12">
                    <div className="bg-[#111823] rounded-xl p-8 gaming-border">
                        <h2 className="text-3xl font-orbitron font-bold mb-8 text-[#ff4654] flex items-center">
                            <AlertTriangle className="mr-3" />
                            {rulesAndRegulations.penalties.title}
                        </h2>
                        {rulesAndRegulations.penalties.rules.map((section, index) => (
                            <div key={section.id} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-[#ffffff]">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.content.map((rule, ruleIndex) => (
                                        <li key={ruleIndex} className="flex items-start text-gray-300">
                                            <span className="text-[#ff4654] mr-3 mt-1">•</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Policies */}
                <section id="policies" className="mb-12">
                    <div className="bg-[#111823] rounded-xl p-8 gaming-border">
                        <h2 className="text-3xl font-orbitron font-bold mb-8 text-[#ba3a46] flex items-center">
                            <FileText className="mr-3" />
                            {rulesAndRegulations.policies.title}
                        </h2>
                        {rulesAndRegulations.policies.rules.map((section, index) => (
                            <div key={section.id} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-[#ffffff]">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.content.map((rule, ruleIndex) => (
                                        <li key={ruleIndex} className="flex items-start text-gray-300">
                                            <span className="text-[#ba3a46] mr-3 mt-1">•</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Legal */}
                <section id="legal" className="mb-12">
                    <div className="bg-[#111823] rounded-xl p-8 gaming-border">
                        <h2 className="text-3xl font-orbitron font-bold mb-8 text-[#ff4654] flex items-center">
                            <Scale className="mr-3" />
                            {rulesAndRegulations.legal.title}
                        </h2>
                        {rulesAndRegulations.legal.rules.map((section, index) => (
                            <div key={section.id} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-[#ffffff]">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.content.map((rule, ruleIndex) => (
                                        <li key={ruleIndex} className="flex items-start text-gray-300">
                                            <span className="text-[#ff4654] mr-3 mt-1">•</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section id="contact" className="mb-12">
                    <div className="bg-[#111823] rounded-xl p-8 gaming-border">
                        <h2 className="text-3xl font-orbitron font-bold mb-8 text-[#ba3a46] flex items-center">
                            <Phone className="mr-3" />
                            {rulesAndRegulations.contact.title}
                        </h2>
                        {rulesAndRegulations.contact.rules.map((section, index) => (
                            <div key={section.id} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-[#ffffff]">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.content.map((rule, ruleIndex) => (
                                        <li key={ruleIndex} className="flex items-start text-gray-300">
                                            <span className="text-[#ba3a46] mr-3 mt-1">•</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Acknowledgment */}
                <section className="mb-12">
                    <div className="bg-gradient-to-r from-[#ff4654]/10 to-[#ba3a46]/10 border border-[#ff4654]/30 rounded-xl p-8">
                        <h2 className="text-3xl font-orbitron font-bold mb-6 text-[#ff4654] flex items-center">
                            <FileText className="mr-3" />
                            {rulesAndRegulations.acknowledgment.title}
                        </h2>
                        <div className="space-y-4">
                            {rulesAndRegulations.acknowledgment.content.map((item, index) => (
                                <div key={index} className="flex items-start text-gray-300">
                                    <span className="text-[#ff4654] mr-3 mt-1 font-bold">{index + 1}.</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Hidden Gaming Reference */}
                <section className="mb-12">
                    <div className="text-center">
                        <p className="text-xs text-gray-600 opacity-50 hover:opacity-100 transition-opacity duration-500">
                            "Some challenges are hidden from plain sight... Use the Kanomi Code to reveal them."
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
