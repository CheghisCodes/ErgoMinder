import {
  PersonStanding,
  Dumbbell,
  Wind,
  Repeat,
  Move,
  Armchair,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Stretch = {
  name: string;
  instructions: string[];
  icon: LucideIcon;
};

export const deskStretches: Stretch[] = [
  {
    name: "Neck Stretch",
    instructions: [
      "Sit up tall and gently tilt your head to one side.",
      "Hold for 15-20 seconds.",
      "Repeat on the other side.",
    ],
    icon: Wind,
  },
  {
    name: "Shoulder Roll",
    instructions: [
      "Sit or stand tall.",
      "Roll your shoulders upwards towards your ears, then back and down.",
      "Repeat 5-10 times in both directions.",
    ],
    icon: Repeat,
  },
  {
    name: "Upper Back Stretch",
    instructions: [
      "Clasp your hands in front of you and round your back.",
      "Reach forward, feeling a stretch between your shoulder blades.",
      "Hold for 15-20 seconds.",
    ],
    icon: PersonStanding,
  },
  {
    name: "Wrist and Finger Stretch",
    instructions: [
      "Extend one arm in front of you, palm up.",
      "Gently bend your wrist down with your other hand.",
      "Hold for 15-20 seconds, then repeat with palm down.",
    ],
    icon: Dumbbell,
  },
];

export type PostureTip = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const postureTips: PostureTip[] = [
  {
    title: "Change Positions",
    description: "Alternate between sitting and standing if you have a standing desk.",
    icon: Move,
  },
  {
    title: "Sit Back",
    description: "Ensure your back is fully against your chair to support your spine.",
    icon: Armchair,
  },
  {
    title: "Take a Walk",
    description: "Even a short walk to the water cooler can help reset your posture.",
    icon: PersonStanding,
  },
  {
    title: "Adjust Your Screen",
    description: "Position your monitor at eye level to avoid straining your neck.",
    icon: Repeat,
  },
];

export const motivationalQuotes: string[] = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "A little progress each day adds up to big results.",
  "The future depends on what you do today.",
  "Well done is better than well said.",
  "You are capable of more than you know.",
  "The expert in anything was once a beginner."
];

    