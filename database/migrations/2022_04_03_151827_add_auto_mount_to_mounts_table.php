<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAutoMountToMountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('mounts', function (Blueprint $table) {
            $table->boolean('mount_on_install')->after('user_mountable')->default(false);
            $table->boolean('auto_mount')->after('mount_on_install')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mounts', function (Blueprint $table) {

        });
    }
}
