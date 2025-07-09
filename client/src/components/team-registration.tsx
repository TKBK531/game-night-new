import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  insertTeamSchema,
  type InsertTeam,
} from "../../../shared/mongo-validation";
import { siteConfig } from "@shared/config";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Gamepad2,
  Flag,
  Users,
  Mail,
  Phone,
  Rocket,
  Crosshair,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "./ui/scroll-reveal";
import { staggerVariants } from "@/hooks/use-scroll-reveal";
import RulesPopup from "./rules-popup";
import RulesPage from "../pages/rules";

export default function TeamRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<"details" | "payment">("details");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    isAvailable: boolean;
    message: string;
    registered?: number;
    maxTeams?: number;
    confirmed?: number;
    queued?: number;
    maxQueue?: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [showRulesPage, setShowRulesPage] = useState(false);
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] =
    useState<InsertTeam | null>(null);

  const form = useForm<InsertTeam>({
    resolver: zodResolver(insertTeamSchema),
    mode: "onSubmit", // Validate on submit to catch missing tournament selection
    defaultValues: {
      teamName: "",
      game: undefined, // Explicitly set to undefined so validation can catch missing selection
      captainEmail: "",
      captainPhone: "",
      player1Name: "",
      player1GamingId: "",
      player1UniversityEmail: "",
      player1ValorantId: "",
      player2Name: "",
      player2GamingId: "",
      player2UniversityEmail: "",
      player2ValorantId: "",
      player3Name: "",
      player3GamingId: "",
      player3UniversityEmail: "",
      player3ValorantId: "",
      player4Name: "",
      player4GamingId: "",
      player4UniversityEmail: "",
      player4ValorantId: "",
      player5Name: "",
      player5GamingId: "",
      player5UniversityEmail: "",
      player5ValorantId: "",
      bankSlip: undefined,
    },
  });

  const registerTeamMutation = useMutation({
    mutationFn: async (data: InsertTeam) => {
      // Use FormData for file uploads
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === "bankSlip" && value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch("/api/teams", {
        method: "POST",
        body: formData, // Send FormData instead of JSON
        credentials: "include",
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw responseData;
      }

      return responseData;
    },
    onSuccess: (data) => {
      if (data.isQueued) {
        toast({
          title: "Added to Registration Queue!",
          description: data.message,
          duration: 8000,
        });
      } else {
        toast({
          title: "Team Registered Successfully!",
          description: "Your team has been registered for the tournament. Get ready to compete!",
        });
      }
      form.reset();
      setCurrentStep("details");
      setAvailabilityStatus(null);
      queryClient.invalidateQueries({ queryKey: ["/api/teams/stats"] });
    },
    onError: (error: any) => {
      console.error("Registration error:", error);

      // Handle validation errors with specific field messages
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors
          .map((err: any) => err.message)
          .join(", ");
        toast({
          title: "Registration Failed",
          description: `${
            error.message || "Validation errors:"
          } ${errorMessages}`,
          variant: "destructive",
        });

        // Set form errors for specific fields
        error.errors.forEach((err: any) => {
          if (err.field) {
            form.setError(err.field as any, {
              type: "manual",
              message: err.message,
            });
          }
        });
      } else {
        // Handle other errors (like duplicate team name)
        toast({
          title: "Registration Failed",
          description:
            error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });

        // If it's a team name error, set the error on the form
        if (error.field === "teamName") {
          form.setError("teamName", {
            type: "manual",
            message: error.message,
          });
        }
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
      setPendingRegistrationData(null);
    },
  });

  // Check registration availability
  const checkAvailability = async (game: string) => {
    setIsCheckingAvailability(true);
    try {
      // Both Valorant and COD need to check availability from backend
      const response = await fetch(`/api/teams/check-availability/${game}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to check availability");
      }
      
      setAvailabilityStatus(data);
      
      if (game === "valorant") {
        // For Valorant: Direct registration if slots available
        if (data.isAvailable) {
          setCurrentStep("payment");
          toast({
            title: "Registration Available!",
            description: data.message,
          });
        } else {
          toast({
            title: "Registration Full",
            description: "Valorant tournament is full. All 8 slots have been taken.",
            variant: "destructive",
          });
        }
      } else {
        // For COD: Queue system
        if (data.isAvailable) {
          setCurrentStep("payment");
          toast({
            title: "Registration Available!",
            description: data.message,
          });
        } else {
          toast({
            title: "Registration Closed",
            description: data.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast({
        title: "Error",
        description: "Failed to check registration availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Handle proceed button
  const handleProceed = async (data: InsertTeam) => {
    if (!data.game) {
      toast({
        title: "Tournament Required",
        description: "Please select a tournament (Valorant or Call of Duty) to register for.",
        variant: "destructive"
      });
      return;
    }

    // If we've already checked and it's not available, don't check again
    if (availabilityStatus && !availabilityStatus.isAvailable) {
      toast({
        title: "Registration Not Available",
        description: availabilityStatus.message,
        variant: "destructive"
      });
      return;
    }

    await checkAvailability(data.game);
  };

  const onSubmit = async (data: InsertTeam) => {
    // Check if rules have been accepted
    if (!hasAcceptedRules) {
      setPendingRegistrationData(data);
      setShowRulesPopup(true);
      return;
    }

    setIsSubmitting(true);
    registerTeamMutation.mutate(data);
  };

  // Handle form submission with step logic
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted, current step:", currentStep);
    console.log("Selected game:", form.getValues("game"));
    
    if (currentStep === "details") {
      // For details step, only validate basic fields (not bank slip or Valorant IDs for now)
      const gameValue = form.getValues("game");
      if (!gameValue) {
        console.log("No game selected");
        toast({
          title: "Tournament Required",
          description: "Please select a tournament (Valorant or Call of Duty) to register for.",
          variant: "destructive"
        });
        return;
      }

      // Basic validation for required fields
      const fieldsToValidate = [
        "teamName",
        "game", 
        "captainEmail",
        "captainPhone",
        "player1Name",
        "player1GamingId", 
        "player1UniversityEmail",
        "player2Name",
        "player2GamingId",
        "player2UniversityEmail", 
        "player3Name",
        "player3GamingId",
        "player3UniversityEmail",
        "player4Name", 
        "player4GamingId",
        "player4UniversityEmail",
        "player5Name",
        "player5GamingId",
        "player5UniversityEmail"
      ];

      // Add Valorant IDs to validation if Valorant is selected
      if (gameValue === "valorant") {
        fieldsToValidate.push(
          "player1ValorantId",
          "player2ValorantId", 
          "player3ValorantId",
          "player4ValorantId",
          "player5ValorantId"
        );
      }

      const isValid = await form.trigger(fieldsToValidate as any);
      console.log("Partial form validation result:", isValid);
      
      if (!isValid) {
        console.log("Form validation failed");
        return;
      }
      
      const formData = form.getValues();
      console.log("Form data:", formData);
      console.log("Proceeding to check availability for:", formData.game);
      
      // First step: proceed to check availability
      await handleProceed(formData);
    } else {
      console.log("Submitting final registration");
      // Second step: validate everything including bank slip for Valorant
      const isValid = await form.trigger();
      
      if (!isValid) {
        console.log("Final form validation failed");
        return;
      }
      
      // Second step: submit the form
      form.handleSubmit(onSubmit)(e);
    }
  };

  const handleRulesAccepted = () => {
    setHasAcceptedRules(true);
    setShowRulesPopup(false);
    toast({
      title: "Rules Accepted",
      description: "You can now proceed with team registration.",
    });
  };

  const handleAgreeAndRegister = () => {
    if (pendingRegistrationData) {
      setHasAcceptedRules(true);
      setShowRulesPopup(false);
      setIsSubmitting(true);
      registerTeamMutation.mutate(pendingRegistrationData);
      setPendingRegistrationData(null);
    }
  };

  const handleViewFullRules = () => {
    setShowRulesPage(true);
  };

  const selectedGame = form.watch("game");

  return (
    <section id="register" className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fadeInUp">
          <div className="text-center mb-16">
            <motion.h2
              className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ff4654]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Team Registration
            </motion.h2>
            <p className="text-xl text-gray-300">
              Register your 5-member team for the ultimate gaming experience
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" delay={0.3}>
          <motion.div
            className="gaming-border rounded-xl p-8"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Form {...form}>
              <form
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                {/* Game Selection */}
                <FormField
                  control={form.control}
                  name="game"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold mb-3 text-[#ff4654] flex items-center">
                        <Gamepad2 className="mr-2" />
                        Select Tournament
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid md:grid-cols-2 gap-4"
                        >
                          <div>
                            <RadioGroupItem
                              value="valorant"
                              id="valorant"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="valorant"
                              className={`cursor-pointer block p-4 rounded-lg border-2 transition-all hover-lift ${
                                selectedGame === "valorant"
                                  ? "border-[#ff4654] bg-[#ff4654]/20"
                                  : "border-transparent gaming-input hover:border-[#ff4654]"
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-[#ff4654]/20 rounded-lg flex items-center justify-center mr-4">
                                  <Crosshair className="text-[#ff4654]" />
                                </div>
                                <div>
                                  <div className="font-semibold text-[#ff4654]">
                                    {siteConfig.tournaments.valorant.name}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {siteConfig.tournaments.valorant.prizePool}{" "}
                                    Prize Pool
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem
                              value="cod"
                              id="cod"
                              className="sr-only"
                            />
                            <Label
                              htmlFor="cod"
                              className={`cursor-pointer block p-4 rounded-lg border-2 transition-all hover-lift ${
                                selectedGame === "cod"
                                  ? "border-[#ba3a46] bg-[#ba3a46]/20"
                                  : "border-transparent gaming-input hover:border-[#ba3a46]"
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-[#ba3a46]/20 rounded-lg flex items-center justify-center mr-4">
                                  <Target className="text-[#ba3a46]" />
                                </div>
                                <div>
                                  <div className="font-semibold text-[#ba3a46]">
                                    {siteConfig.tournaments.cod.name}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {siteConfig.tournaments.cod.prizePool} Prize
                                    Pool
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                      {/* Additional error display for tournament selection */}
                      {form.formState.isSubmitted && !selectedGame && (
                        <p className="text-sm font-medium text-destructive mt-2">
                          Please select a tournament to register for
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {/* Team Name */}
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold mb-3 text-[#ff4654] flex items-center">
                        <Flag className="mr-2" />
                        Team Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="gaming-input p-4 text-white placeholder-gray-400"
                          placeholder="Enter unique team name"
                        />
                      </FormControl>
                      <p className="text-sm text-gray-400">
                        Team name must be unique and 3-20 characters long
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Team Members */}
                <div>
                  <label className="text-lg font-semibold mb-3 text-[#ff4654] flex items-center">
                    <Users className="mr-2" />
                    Team Members (5 Required)
                  </label>

                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((playerNum) => (
                      <div key={playerNum} className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`player${playerNum}Name` as keyof InsertTeam}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-300">
                                  Player {playerNum} Name{" "}
                                  {playerNum === 1 && "(Team Captain)"}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="gaming-input p-3 text-white placeholder-gray-400"
                                    placeholder={
                                      playerNum === 1
                                        ? "Team Captain"
                                        : "Player name"
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={
                              `player${playerNum}GamingId` as keyof InsertTeam
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-300">
                                  Gaming ID
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="gaming-input p-3 text-white placeholder-gray-400"
                                    placeholder="In-game username"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={
                              `player${playerNum}UniversityEmail` as keyof InsertTeam
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium ">
                                  University Email
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    className="gaming-input p-3 text-white placeholder-gray-400"
                                    placeholder="student@pdn.ac.lk"
                                  />
                                </FormControl>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Valorant User ID - Only show when Valorant is selected */}
                        {selectedGame === "valorant" && (
                          <FormField
                            control={form.control}
                            name={
                              `player${playerNum}ValorantId` as keyof InsertTeam
                            }
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-[#ff4654] flex items-center">
                                  <Crosshair className="mr-1 w-4 h-4" />
                                  Player {playerNum} Valorant User ID (Required
                                  for Valorant)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="gaming-input p-3 text-white placeholder-gray-400 border-[#ff4654]/50"
                                    placeholder="e.g., Username#1234"
                                  />
                                </FormControl>
                                <p className="text-xs text-gray-400">
                                  Your Valorant username with tag (found in game
                                  profile)
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="captainEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold mb-3 text-[#ff4654] flex items-center">
                          <Mail className="mr-2" />
                          Team Captain Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="gaming-input p-4 text-white placeholder-gray-400"
                            placeholder="captain@email.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="captainPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold mb-3 text-[#ff4654] flex items-center">
                          <Phone className="mr-2" />
                          Contact Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            className="gaming-input p-4 text-white placeholder-gray-400"
                            placeholder="+91 98765 43210"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Availability Status */}
                {availabilityStatus && (
                  <div className={`rounded-lg p-4 text-center ${
                    availabilityStatus.isAvailable 
                      ? "bg-[#00ff00]/10 border border-[#00ff00]/30" 
                      : "bg-[#ff4654]/10 border border-[#ff4654]/30"
                  }`}>
                    <div className={`flex items-center justify-center ${
                      availabilityStatus.isAvailable ? "text-[#00ff00]" : "text-[#ff4654]"
                    }`}>
                      {availabilityStatus.isAvailable ? (
                        <CheckCircle className="mr-2" size={20} />
                      ) : (
                        <XCircle className="mr-2" size={20} />
                      )}
                      <span className="font-semibold">
                        {availabilityStatus.isAvailable ? "Registration Open" : "Registration Closed"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      {availabilityStatus.message}
                    </p>
                    {selectedGame === "valorant" ? (
                      <p className="text-xs text-gray-400 mt-1">
                        {availabilityStatus.registered}/{availabilityStatus.maxTeams} teams registered
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">
                        {availabilityStatus.confirmed}/{availabilityStatus.maxTeams} teams confirmed
                      </p>
                    )}
                  </div>
                )}

                {/* Bank Slip Upload - Show for Valorant when available, or COD when in queue */}
                {currentStep === "payment" && availabilityStatus?.isAvailable && selectedGame === "valorant" && (
                  <FormField
                    control={form.control}
                    name="bankSlip"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-[#ff4654] flex items-center">
                          <Rocket className="mr-2" />
                          Bank Slip Upload (Registration Fee:{" "}
                          {selectedGame === "valorant" 
                            ? siteConfig.tournaments.valorant.registrationFee 
                            : siteConfig.tournaments.cod.registrationFee} (Dinner Included))
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="gaming-border rounded-lg p-6 text-center hover-lift">
                              <input
                                {...field}
                                type="file"
                                accept={siteConfig.features.teamRegistration.allowedFileTypes.join(
                                  ","
                                )}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  onChange(file);
                                }}
                                className="hidden"
                                id="bankSlip"
                              />
                              <label
                                htmlFor="bankSlip"
                                className="cursor-pointer block"
                              >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff4654]/20 flex items-center justify-center">
                                  <Rocket className="text-2xl text-[#ff4654]" />
                                </div>
                                <div className="text-lg font-semibold text-white mb-2">
                                  {value ? "File Selected!" : "Upload Bank Slip"}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {value
                                    ? value.name
                                    : `Click to select image or PDF (Max ${siteConfig.features.teamRegistration.maxFileSize})`}
                                </div>
                              </label>
                            </div>
                            <div className="text-sm text-gray-400 space-y-2">
                              <p>Bank Details: </p>
                              <p>• Account Name:{" "}
                                {siteConfig.payment.accountName}
                              </p>
                              <p>
                                • Account Number:{" "}
                                {siteConfig.payment.accountNumber}
                              </p>
                              <p>• Bank: {siteConfig.payment.bankName}</p>
                              <p>• Branch: {siteConfig.payment.branchName}</p>
                              <p>
                                • Remark : GameNight - TeamName
                              </p>
                              <p>
                                • Please upload payment proof to complete
                                registration
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* COD Queue Information */}
                {currentStep === "payment" && availabilityStatus?.isAvailable && selectedGame === "cod" && (
                  <div className="bg-[#ba3a46]/10 border border-[#ba3a46]/30 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ba3a46]/20 flex items-center justify-center">
                      <Target className="text-2xl text-[#ba3a46]" />
                    </div>
                    <div className="text-lg font-semibold text-[#ba3a46] mb-2">
                      COD Registration Queue
                    </div>
                    <div className="text-sm text-gray-300 space-y-2">
                      <p>
                        <strong>No payment required at this time.</strong>
                      </p>
                      <p>
                        Your team will be added to the registration queue. Due to high demand, the first teams to register will be notified with bank details.
                      </p>
                      <p>
                        <strong>If selected:</strong> You will have 24 hours to complete payment after notification.
                      </p>
                      <p>
                        Registration fee: <strong>{siteConfig.tournaments.cod.registrationFee}</strong> (if selected)
                      </p>
                    </div>
                  </div>
                )}

                {/* Rules Acceptance Status */}
                {hasAcceptedRules && (
                  <div className="bg-[#00ff00]/10 border border-[#00ff00]/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center text-[#00ff00]">
                      <Target className="mr-2" size={20} />
                      <span className="font-semibold">
                        Rules & Regulations Accepted
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      You have read and agreed to all tournament rules and
                      regulations.
                    </p>
                  </div>
                )}

                {/* Registration Button */}
                <div className="text-center pt-6">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || 
                      isCheckingAvailability
                    }
                    className="gaming-button px-12 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    {currentStep === "details" ? (
                      <>
                        <ArrowRight className="mr-2" />
                        {isCheckingAvailability ? "Checking Availability..." : "Proceed"}
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2" />
                        {isSubmitting
                          ? (selectedGame === "cod" ? "Joining Queue..." : "Registering...")
                          : hasAcceptedRules
                          ? (selectedGame === "cod" ? "Join COD Queue" : "Register Team")
                          : (selectedGame === "cod" ? "Review Rules & Join Queue" : "Review Rules & Register Team")}
                      </>
                    )}
                  </button>
                  
                  {currentStep === "details" && (
                    <p className="text-sm text-gray-400 mt-4">
                      Fill all details and click Proceed to check registration availability
                    </p>
                  )}
                  
                  {currentStep === "payment" && (
                    <>
                      <p className="text-sm text-gray-400 mt-4">
                        {selectedGame === "valorant" ? (
                          <>
                            Registration fee:{" "}
                            {siteConfig.tournaments.valorant.registrationFee}
                            {" per team • No account creation required"}
                          </>
                        ) : (
                          "COD registration will be queued - no payment required initially"
                        )}
                      </p>
                      {!hasAcceptedRules && selectedGame === "valorant" && (
                        <p className="text-sm text-[#ff4654] mt-2">
                          Click to review rules & complete registration in one step
                        </p>
                      )}
                      {selectedGame === "cod" && (
                        <p className="text-sm text-[#ba3a46] mt-2">
                          Click to join the COD registration queue
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep("details");
                          setAvailabilityStatus(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white underline mt-2"
                      >
                        ← Go back to edit details
                      </button>
                    </>
                  )}
                </div>
              </form>
            </Form>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Rules Popup */}
      <RulesPopup
        isOpen={showRulesPopup}
        onClose={() => {
          setShowRulesPopup(false);
          setPendingRegistrationData(null);
        }}
        onAccept={handleRulesAccepted}
        onViewFullRules={handleViewFullRules}
        onAgreeAndRegister={
          pendingRegistrationData ? handleAgreeAndRegister : undefined
        }
        isRegistering={isSubmitting}
      />

      {/* Full Rules Page */}
      {showRulesPage && (
        <div className="fixed inset-0 z-50 bg-[#0a0f1a]">
          <RulesPage onBack={() => setShowRulesPage(false)} />
        </div>
      )}
    </section>
  );
}
