import { useState } from "react";
import { X, FileText, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { rulesAndRegulations } from "../../../shared/rules";

interface RulesPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    onViewFullRules: () => void;
}

export default function RulesPopup({ isOpen, onClose, onAccept, onViewFullRules }: RulesPopupProps) {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [hasAgreed, setHasAgreed] = useState(false);

    if (!isOpen) return null;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        if (scrollPercentage >= 0.95) {
            setHasScrolledToBottom(true);
        }
    };

    const handleAccept = () => {
        if (hasAgreed && hasScrolledToBottom) {
            onAccept();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111823] rounded-xl max-w-4xl max-h-[90vh] w-full gaming-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#ff4654]/30">
                    <div className="flex items-center">
                        <FileText className="text-[#ff4654] mr-3" size={24} />
                        <h2 className="text-2xl font-orbitron font-bold text-[#ff4654]">
                            Rules & Regulations
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div
                    className="p-6 max-h-[60vh] overflow-y-auto"
                    onScroll={handleScroll}
                >
                    {/* Important Notice */}
                    <div className="bg-[#ff4654]/10 border border-[#ff4654]/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <AlertTriangle className="text-[#ff4654] mr-3 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-[#ff4654] mb-2">Important Notice</h3>
                                <p className="text-gray-300 text-sm">
                                    Please read through all rules carefully. You must scroll to the bottom and agree to all terms before proceeding with registration.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Key Rules Summary */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-[#ff4654] mb-3">Key Registration Requirements</h3>
                            <ul className="space-y-2">
                                {rulesAndRegulations.general.rules.find(r => r.id === "registration")?.content.map((rule, index) => (
                                    <li key={index} className="flex items-start text-gray-300 text-sm">
                                        <span className="text-[#ff4654] mr-2 mt-1">•</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[#ba3a46] mb-3">Code of Conduct</h3>
                            <ul className="space-y-2">
                                {rulesAndRegulations.general.rules.find(r => r.id === "conduct")?.content.slice(0, 3).map((rule, index) => (
                                    <li key={index} className="flex items-start text-gray-300 text-sm">
                                        <span className="text-[#ba3a46] mr-2 mt-1">•</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[#ff4654] mb-3">Team Composition Rules</h3>
                            <ul className="space-y-2">
                                {rulesAndRegulations.tournaments.valorant.rules.find(r => r.id === "team-composition")?.content.map((rule, index) => (
                                    <li key={index} className="flex items-start text-gray-300 text-sm">
                                        <span className="text-[#ff4654] mr-2 mt-1">•</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-[#ba3a46] mb-3">Penalties for Rule Violations</h3>
                            <ul className="space-y-2">
                                {rulesAndRegulations.penalties.rules.find(r => r.id === "violations")?.content.map((rule, index) => (
                                    <li key={index} className="flex items-start text-gray-300 text-sm">
                                        <span className="text-[#ba3a46] mr-2 mt-1">•</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Liability Waiver */}
                        <div className="bg-[#ba3a46]/10 border border-[#ba3a46]/30 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-[#ba3a46] mb-3">Liability Waiver</h3>
                            <ul className="space-y-2">
                                {rulesAndRegulations.legal.rules.find(r => r.id === "liability")?.content.slice(0, 3).map((rule, index) => (
                                    <li key={index} className="flex items-start text-gray-300 text-sm">
                                        <span className="text-[#ba3a46] mr-2 mt-1">•</span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Acknowledgment */}
                        <div className="bg-[#ff4654]/10 border border-[#ff4654]/30 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-[#ff4654] mb-3">By Proceeding, You Acknowledge:</h3>
                            <ul className="space-y-2">
                                {rulesAndRegulations.acknowledgment.content.slice(0, 4).map((item, index) => (
                                    <li key={index} className="flex items-start text-gray-300 text-sm">
                                        <span className="text-[#ff4654] mr-2 mt-1 font-bold">{index + 1}.</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Scroll indicator */}
                        {!hasScrolledToBottom && (
                            <div className="text-center py-4">
                                <div className="text-[#ff4654] text-sm animate-pulse">
                                    ↓ Please scroll down to continue ↓
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-[#ff4654]/30 p-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onViewFullRules}
                            className="flex items-center text-[#ba3a46] hover:text-[#ff4654] transition-colors"
                        >
                            <ExternalLink className="mr-2" size={16} />
                            View Complete Rules & Regulations
                        </button>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasAgreed}
                                    onChange={(e) => setHasAgreed(e.target.checked)}
                                    className="sr-only"
                                    disabled={!hasScrolledToBottom}
                                />
                                <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors ${hasScrolledToBottom
                                        ? hasAgreed
                                            ? 'border-[#ff4654] bg-[#ff4654]'
                                            : 'border-[#ff4654] hover:border-[#ba3a46]'
                                        : 'border-gray-600 bg-gray-800'
                                    }`}>
                                    {hasAgreed && <CheckCircle className="text-white" size={12} />}
                                </div>
                                <span className={`text-sm ${hasScrolledToBottom ? 'text-white' : 'text-gray-500'
                                    }`}>
                                    I have read and agree to all rules and regulations
                                </span>
                            </label>

                            <button
                                onClick={handleAccept}
                                disabled={!hasAgreed || !hasScrolledToBottom}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${hasAgreed && hasScrolledToBottom
                                        ? 'bg-[#ff4654] text-white hover:bg-[#ba3a46] gaming-button'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Accept & Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
