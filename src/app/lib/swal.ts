import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Common styles to match the dashbaord's premium look
const commonConfig = {
    customClass: {
        popup: 'rounded-2xl border-none shadow-2xl',
        confirmButton: 'bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5 rounded-xl transition-all active:scale-95',
        cancelButton: 'bg-muted hover:bg-muted/80 text-muted-foreground font-medium px-6 py-2.5 rounded-xl transition-all active:scale-95',
    },
    buttonsStyling: false,
};

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const swal = {
    toast: (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        Toast.fire({
            icon,
            title
        });
    },
    alert: (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        return MySwal.fire({
            ...commonConfig,
            title,
            text,
            icon,
            showConfirmButton: true,
        });
    },
    confirm: (title: string, text: string, confirmText: string = 'Confirm') => {
        return MySwal.fire({
            ...commonConfig,
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: 'Cancel',
        });
    },
    success: (title: string, text?: string) => {
        return MySwal.fire({
            ...commonConfig,
            title,
            text,
            icon: 'success',
        });
    },
    error: (title: string, text?: string) => {
        return MySwal.fire({
            ...commonConfig,
            title,
            text,
            icon: 'error',
        });
    }
};
