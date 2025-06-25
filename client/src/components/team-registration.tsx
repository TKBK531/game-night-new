import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertTeamSchema, type InsertTeam } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Flag, Users, Mail, Phone, Rocket, Crosshair, Target } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function TeamRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertTeam>({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: {
      teamName: "",
      game: undefined,
      captainEmail: "",
      captainPhone: "",
      player1Name: "",
      player1GamingId: "",
      player2Name: "",
      player2GamingId: "",
      player3Name: "",
      player3GamingId: "",
      player4Name: "",
      player4GamingId: "",
      player5Name: "",
      player5GamingId: "",
      bankSlip: undefined,
    },
  });

  const registerTeamMutation = useMutation({
    mutationFn: async (data: InsertTeam) => {
      const response = await apiRequest("POST", "/api/teams", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Team Registered Successfully!",
        description: "Your team has been registered for the tournament. Get ready to compete!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/teams/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: InsertTeam) => {
    setIsSubmitting(true);
    registerTeamMutation.mutate(data);
  };

  const selectedGame = form.watch("game");

  return (
    <section id="register" className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-[#ff4654] animate-glow">
            Team Registration
          </h2>
          <p className="text-xl text-gray-300">
            Register your 5-member team for the ultimate gaming experience
          </p>
        </div>

        <div className="gaming-border rounded-xl p-8 animate-slide-up">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Game Selection */}
              <FormField
                control={form.control}
                name="game"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-[hsl(185,100%,50%)] flex items-center">
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
                          <RadioGroupItem value="valorant" id="valorant" className="sr-only" />
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
                                <div className="font-semibold text-[#ff4654]">Valorant Championship</div>
                                <div className="text-sm text-gray-400">₹50,000 Prize Pool</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        <div>
                          <RadioGroupItem value="cod" id="cod" className="sr-only" />
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
                                <div className="font-semibold text-[#ba3a46]">COD Warzone Battle</div>
                                <div className="text-sm text-gray-400">₹75,000 Prize Pool</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Team Name */}
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-[hsl(280,100%,70%)] flex items-center">
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
                    <p className="text-sm text-gray-400">Team name must be unique and 3-20 characters long</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Team Members */}
              <div>
                <label className="block text-lg font-semibold mb-3 text-[#ff4654] flex items-center">
                  <Users className="mr-2" />
                  Team Members (5 Required)
                </label>
                
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((playerNum) => (
                    <div key={playerNum} className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`player${playerNum}Name` as keyof InsertTeam}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-300">
                              Player {playerNum} Name {playerNum === 1 && "(Team Captain)"}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                className="gaming-input p-3 text-white placeholder-gray-400" 
                                placeholder={playerNum === 1 ? "Team Captain" : "Player name"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`player${playerNum}GamingId` as keyof InsertTeam}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-300">Gaming ID</FormLabel>
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
                      <FormLabel className="text-lg font-semibold text-[hsl(280,100%,70%)] flex items-center">
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
                      <FormLabel className="text-lg font-semibold text-[hsl(280,100%,70%)] flex items-center">
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

              {/* Bank Slip Upload */}
              <FormField
                control={form.control}
                name="bankSlip"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-[#ff4654] flex items-center">
                      <Rocket className="mr-2" />
                      Bank Slip Upload (Registration Fee: ₹500)
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="gaming-border rounded-lg p-6 text-center hover-lift">
                          <input
                            {...field}
                            type="file"
                            accept="image/*,.pdf"
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
                              {value ? 'File Selected!' : 'Upload Bank Slip'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {value ? value.name : 'Click to select image or PDF (Max 5MB)'}
                            </div>
                          </label>
                        </div>
                        <div className="text-sm text-gray-400 space-y-2">
                          <p>• Bank Details: Account Name: GameZone Events</p>
                          <p>• Account Number: 1234567890 | IFSC: BANK0001234</p>
                          <p>• Please upload payment proof to complete registration</p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Registration Button */}
              <div className="text-center pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="gaming-button px-12 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  <Rocket className="mr-2" />
                  {isSubmitting ? "Registering..." : "Register Team"}
                </button>
                <p className="text-sm text-gray-400 mt-4">
                  Registration fee: ₹500 per team • No account creation required
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
