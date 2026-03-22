import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Habit } from "../backend";
import { HabitCategory } from "../backend";

const EMOJIS = [
  "\uD83D\uDCA7",
  "\uD83C\uDFC3",
  "\uD83E\uDDD8",
  "\uD83D\uDE34",
  "\uD83D\uDCD6",
  "\uD83E\uDD57",
  "\uD83D\uDC8A",
  "\uD83C\uDFCB\uFE0F",
  "\uD83D\uDEB6",
  "\uD83C\uDFAF",
  "\u270D\uFE0F",
  "\uD83C\uDFB8",
  "\uD83C\uDF3F",
  "\u2615",
  "\uD83E\uDDE0",
  "\u2764\uFE0F",
  "\uD83E\uDD38",
  "\uD83C\uDFCA",
  "\uD83D\uDEB4",
  "\uD83C\uDF4E",
  "\uD83C\uDF05",
  "\uD83E\uDDF9",
  "\uD83D\uDCBB",
  "\uD83C\uDFA8",
  "\uD83C\uDF19",
  "\u2B50",
  "\uD83C\uDFC6",
  "\uD83C\uDF0A",
  "\uD83D\uDD11",
  "\uD83E\uDEB1",
];

const CAT_LABELS: Record<HabitCategory, string> = {
  [HabitCategory.health]: "Health",
  [HabitCategory.wellness]: "Wellness",
  [HabitCategory.productivity]: "Productivity",
  [HabitCategory.mindfulness]: "Mindfulness",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  isPending: boolean;
  editHabit?: Habit | null;
}

export default function AddHabitModal({
  open,
  onClose,
  onSave,
  isPending,
  editHabit,
}: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("\u2B50");
  const [category, setCategory] = useState<HabitCategory>(HabitCategory.health);
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (open) {
      setName(editHabit?.name ?? "");
      setEmoji(editHabit?.emoji ?? "\u2B50");
      setCategory(editHabit?.category ?? HabitCategory.health);
      setDescription(editHabit?.description ?? "");
      setNameError("");
    }
  }, [open, editHabit]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Habit name is required");
      return;
    }
    setNameError("");
    onSave({
      id: editHabit?.id ?? 0n,
      name: name.trim(),
      emoji,
      category,
      description: description.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="habit.modal">
        <DialogHeader>
          <DialogTitle>
            {editHabit ? "Edit Habit" : "Add New Habit"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Choose an emoji
            </Label>
            <div className="grid grid-cols-10 gap-1">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                    emoji === e
                      ? "bg-teal-accent/20 ring-2 ring-teal-accent"
                      : "hover:bg-secondary"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label
              htmlFor="habit-name"
              className="text-sm font-medium mb-1.5 block"
            >
              Habit name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="habit-name"
              data-ocid="habit.input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="e.g. Drink 8 glasses of water"
              className="bg-background"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {nameError && (
              <p
                data-ocid="habit.name.error_state"
                className="text-xs text-destructive mt-1"
              >
                {nameError}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as HabitCategory)}
            >
              <SelectTrigger data-ocid="habit.select" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(HabitCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CAT_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="habit-desc"
              className="text-sm font-medium mb-1.5 block"
            >
              Goal / Description
            </Label>
            <Textarea
              id="habit-desc"
              data-ocid="habit.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's your goal for this habit?"
              rows={2}
              className="bg-background resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            data-ocid="habit.cancel_button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            data-ocid="habit.submit_button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-teal-accent hover:bg-teal-accent/90 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : editHabit ? (
              "Save Changes"
            ) : (
              "Add Habit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
