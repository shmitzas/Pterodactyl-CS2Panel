<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * \Pterodactyl\Models\UserSSHKey.
 *
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $fingerprint
 * @property string $public_key
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Pterodactyl\Models\User $user
 *
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey newQuery()
 * @method static \Illuminate\Database\Query\Builder|UserSSHKey onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey query()
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey whereFingerprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey wherePublicKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserSSHKey whereUserId($value)
 * @method static \Illuminate\Database\Query\Builder|UserSSHKey withTrashed()
 * @method static \Illuminate\Database\Query\Builder|UserSSHKey withoutTrashed()
 *
 * @mixin \Eloquent
 *
 * @method static \Database\Factories\UserSSHKeyFactory factory(...$parameters)
 */
class UserSSHKey extends Model
{
    use SoftDeletes;

    public const RESOURCE_NAME = 'ssh_key';
    public const PUBLIC_KEY_MAX_LENGTH = 16384;

    protected const PUBLIC_KEY_PREFIXES = [
        'ssh-rsa ',
        'ssh-ed25519 ',
        'ecdsa-sha2-',
        'sk-ssh-ed25519@openssh.com ',
        'sk-ecdsa-sha2-nistp256@openssh.com ',
        '-----BEGIN PUBLIC KEY-----',
        '-----BEGIN RSA PUBLIC KEY-----',
        '-----BEGIN EC PUBLIC KEY-----',
        '-----BEGIN DSA PUBLIC KEY-----',
        '---- BEGIN SSH2 PUBLIC KEY ----',
    ];

    protected $table = 'user_ssh_keys';

    protected $fillable = [
        'name',
        'public_key',
        'fingerprint',
    ];

    public static array $validationRules = [
        'name' => ['required', 'string'],
        'fingerprint' => ['required', 'string'],
        'public_key' => ['required', 'string', 'max:' . self::PUBLIC_KEY_MAX_LENGTH],
    ];

    /**
     * Whether the value looks like public key material we accept, before handing it to the
     * key parser. Rejects certificates and other formats the parser would otherwise try.
     */
    public static function isSupportedPublicKeyMaterial(string $value): bool
    {
        $value = trim($value);

        if ($value === '' || strlen($value) > self::PUBLIC_KEY_MAX_LENGTH || str_contains($value, "\0")) {
            return false;
        }

        foreach (self::PUBLIC_KEY_PREFIXES as $prefix) {
            if (str_starts_with($value, $prefix)) {
                return true;
            }
        }

        return false;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
