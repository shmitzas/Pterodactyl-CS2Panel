<?php

namespace Pterodactyl\Http\Requests\Api\Application\Nodes;

use Pterodactyl\Services\Acl\Api\AdminAcl;

class GetNodeConfigurationRequest extends GetNodesRequest
{
    /**
     * The configuration contains the node's decrypted daemon token, so reading it
     * requires write access to nodes.
     */
    protected int $permission = AdminAcl::WRITE;
}
