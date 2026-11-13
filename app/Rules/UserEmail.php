<?php

namespace Pterodactyl\Rules;

use Illuminate\Contracts\Validation\Rule;

class UserEmail implements Rule
{
    /**
     * Rejects control characters, which Laravel 10's email rule lets through (CVE-2026-48019), and a
     * local part starting with a dash, which a sendmail-style transport could read as a command line flag.
     *
     * @param string $attribute
     */
    public function passes($attribute, $value): bool
    {
        if (!is_string($value)) {
            return true;
        }

        if (preg_match('/\p{Cc}/u', $value) !== 0) {
            return false;
        }

        $local = explode('@', $value, 2)[0] ?? '';
        $local = trim($local, '"');

        return !str_starts_with($local, '-');
    }

    public function message(): string
    {
        return 'The :attribute must not start with a dash or contain control characters.';
    }

    public function __toString(): string
    {
        return 'p_user_email';
    }
}
