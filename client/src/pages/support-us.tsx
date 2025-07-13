import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Home, CreditCard, Building2, Hash, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { siteConfig } from "../../../shared/config";

export default function SupportUsPage() {
    const { toast } = useToast();

    // Use bank details from shared config
    const bankDetails = {
        bankName: "Bank of Ceylon",
        accountName: "Computer Society",
        accountNumber: "1283667",
        branch: "Peradeniya",
        ifscCode: siteConfig.payment.ifscCode,
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Copied!",
                description: `${label} copied to clipboard`,
            });
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#111823] via-[#0a0f1a] to-[#1a2332] text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-grid-pattern"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#ff4654] to-[#ba3a46] bg-clip-text text-transparent"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        Support Us
                    </motion.h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                        Help us make Game Night Reignite the ultimate gaming experience!
                        Your support helps cover event costs, prizes, and venue expenses.
                    </p>
                </motion.div>

                {/* Bank Details Card */}
                <motion.div
                    className="max-w-2xl mx-auto mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <Card className="bg-[#111823]/80 backdrop-blur-lg border-[#ff4654]/30 shadow-2xl hover:shadow-[0_0_40px_rgba(255,70,84,0.3)] transition-all duration-300">
                        <CardHeader className="text-center">
                            <motion.div
                                className="mx-auto mb-4 p-3 bg-gradient-to-r from-[#ff4654] to-[#ba3a46] rounded-full w-fit"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CreditCard className="h-8 w-8 text-white" />
                            </motion.div>
                            <CardTitle className="text-2xl md:text-3xl text-white">
                                Bank Account Details
                            </CardTitle>
                            <CardDescription className="text-gray-300 text-lg">
                                Use these details to make your donation
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Bank Name */}
                            <motion.div
                                className="flex items-center justify-between p-4 bg-[#1a2332]/50 rounded-lg border border-[#ff4654]/20 hover:border-[#ff4654]/40 transition-all duration-300"
                                whileHover={{ scale: 1.02, x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <Building2 className="h-5 w-5 text-[#ff4654]" />
                                    <div>
                                        <p className="text-sm text-gray-400">Bank Name</p>
                                        <p className="text-white font-semibold">{bankDetails.bankName}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(bankDetails.bankName, "Bank name")}
                                    className="text-gray-400 hover:text-[#ff4654] hover:bg-[#ff4654]/10 transition-all duration-300"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </motion.div>

                            {/* Account Name */}
                            <motion.div
                                className="flex items-center justify-between p-4 bg-[#1a2332]/50 rounded-lg border border-[#ff4654]/20 hover:border-[#ff4654]/40 transition-all duration-300"
                                whileHover={{ scale: 1.02, x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <User className="h-5 w-5 text-[#ba3a46]" />
                                    <div>
                                        <p className="text-sm text-gray-400">Account Name</p>
                                        <p className="text-white font-semibold">{bankDetails.accountName}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(bankDetails.accountName, "Account name")}
                                    className="text-gray-400 hover:text-[#ff4654] hover:bg-[#ff4654]/10 transition-all duration-300"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </motion.div>

                            {/* Account Number */}
                            <motion.div
                                className="flex items-center justify-between p-4 bg-[#1a2332]/50 rounded-lg border border-[#ff4654]/20 hover:border-[#ff4654]/40 transition-all duration-300"
                                whileHover={{ scale: 1.02, x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <Hash className="h-5 w-5 text-[#ff4654]" />
                                    <div>
                                        <p className="text-sm text-gray-400">Account Number</p>
                                        <p className="text-white font-semibold font-mono text-lg">{bankDetails.accountNumber}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                                    className="text-gray-400 hover:text-[#ff4654] hover:bg-[#ff4654]/10 transition-all duration-300"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </motion.div>

                            {/* Branch */}
                            <motion.div
                                className="flex items-center justify-between p-4 bg-[#1a2332]/50 rounded-lg border border-[#ff4654]/20 hover:border-[#ff4654]/40 transition-all duration-300"
                                whileHover={{ scale: 1.02, x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <Building2 className="h-5 w-5 text-[#ba3a46]" />
                                    <div>
                                        <p className="text-sm text-gray-400">Branch</p>
                                        <p className="text-white font-semibold">{bankDetails.branch}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(bankDetails.branch, "Branch")}
                                    className="text-gray-400 hover:text-[#ff4654] hover:bg-[#ff4654]/10 transition-all duration-300"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </motion.div>

                            {/* IFSC Code */}
                            {/* <motion.div
                                className="flex items-center justify-between p-4 bg-[#1a2332]/50 rounded-lg border border-[#ff4654]/20 hover:border-[#ff4654]/40 transition-all duration-300"
                                whileHover={{ scale: 1.02, x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <Hash className="h-5 w-5 text-[#ff4654]" />
                                    <div>
                                        <p className="text-sm text-gray-400">IFSC Code</p>
                                        <p className="text-white font-semibold font-mono">{bankDetails.ifscCode}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(bankDetails.ifscCode, "IFSC code")}
                                    className="text-gray-400 hover:text-[#ff4654] hover:bg-[#ff4654]/10 transition-all duration-300"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </motion.div> */}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Support Message */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <div className="max-w-3xl mx-auto">
                        <Card className="bg-gradient-to-r from-[#ff4654]/20 to-[#ba3a46]/20 backdrop-blur-lg border-[#ff4654]/30 hover:border-[#ff4654]/50 transition-all duration-300">
                            <CardContent className="p-8">
                                <motion.h3
                                    className="text-2xl font-bold mb-4 text-white"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    Every Contribution Matters! 🎮
                                </motion.h3>
                                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                    Your support helps us organize amazing tournaments, provide better prizes,
                                    improve the gaming experience, and create unforgettable memories for all participants.
                                    Whether big or small, every donation makes a difference!
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <motion.div
                                        className="p-4 bg-[#111823]/50 rounded-lg border border-[#ff4654]/20 hover:border-[#ff4654]/40 transition-all duration-300"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="text-2xl font-bold text-[#ff4654]">🏆</p>
                                        <p className="text-white font-semibold">Better Prizes</p>
                                    </motion.div>
                                    <motion.div
                                        className="p-4 bg-[#111823]/50 rounded-lg border border-[#ff4654]/20 hover:border-[#ff4654]/40 transition-all duration-300"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="text-2xl font-bold text-[#ba3a46]">🎯</p>
                                        <p className="text-white font-semibold">Enhanced Experience</p>
                                    </motion.div>
                                    <motion.div
                                        className="p-4 bg-[#111823]/50 rounded-lg border border-[#ff4654]/20 hover:border-[#ff4654]/40 transition-all duration-300"
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="text-2xl font-bold text-[#ff4654]">🎉</p>
                                        <p className="text-white font-semibold">Bigger Events</p>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Navigation Button */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <Link href="/">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-[#ff4654] to-[#ba3a46] hover:from-[#ff4654]/80 hover:to-[#ba3a46]/80 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-[0_0_25px_rgba(255,70,84,0.4)] transition-all duration-300"
                            >
                                <Home className="mr-2 h-5 w-5" />
                                Back to Home
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Footer Note */}
                <motion.div
                    className="text-center mt-12 text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <p className="text-sm">
                        Thank you for supporting Game Night Reignite! 💜
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
