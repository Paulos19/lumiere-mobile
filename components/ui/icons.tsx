import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChefHat,
  ChevronRight,
  Clock,
  Film,
  Flame,
  Home,
  Loader2 // <--- Adicionado
  ,
  LogOut,
  LucideIcon,
  Moon,
  PlayCircle,
  Quote,
  Sun,
  User,
  Users,
  Utensils
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';

function interopIcon(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}

// Registrar ícones
interopIcon(Utensils);
interopIcon(User);
interopIcon(Home);
interopIcon(ChevronRight);
interopIcon(ArrowRight);
interopIcon(ArrowLeft);
interopIcon(ChefHat);
interopIcon(LogOut);
interopIcon(Moon);
interopIcon(Sun);
interopIcon(Clock);
interopIcon(Users);
interopIcon(Flame);
interopIcon(Bookmark);
interopIcon(Check);
interopIcon(Quote);
interopIcon(Film);
interopIcon(PlayCircle);
interopIcon(Loader2); // <--- Registrar

export { ArrowLeft, ArrowRight, Bookmark, Check, ChefHat, ChevronRight, Clock, Film, Flame, Home, Loader2, LogOut, Moon, PlayCircle, Quote, Sun, User, Users, Utensils };
