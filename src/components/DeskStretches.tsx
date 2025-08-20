import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deskStretches } from "@/lib/constants";
import { PersonStanding } from "lucide-react";

export default function DeskStretches() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <PersonStanding className="h-5 w-5 text-primary" />
          Desk Stretch Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {deskStretches.map((stretch, index) => (
            <AccordionItem value={`item-${index}`} key={stretch.name}>
              <AccordionTrigger>
                <div className="flex items-center gap-4 text-left">
                  <stretch.icon className="h-6 w-6 text-accent flex-shrink-0" />
                  <span className="font-medium">{stretch.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-8 space-y-2 text-muted-foreground">
                  {stretch.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
