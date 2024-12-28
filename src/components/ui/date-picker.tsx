"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    className?: string;
    onChange?: (date: Date | undefined) => void;
    defaultValue?: Date;
}

export function DatePicker({ className, onChange, defaultValue }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(defaultValue);

    const handleDateChange = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (onChange) {
            onChange(selectedDate);
        }
    };

    return (
        <div className={className}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}