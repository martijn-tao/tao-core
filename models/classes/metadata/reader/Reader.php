<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (update and modification) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\tao\model\metadata\reader;

use oat\oatbox\PhpSerializable;
use oat\tao\model\metadata\exception\reader\MetadataReaderNotFoundException;

/**
 * Interface Reader
 *
 * @author Camille Moyon
 * @package oat\tao\model\metadata\reader
 */
interface Reader extends PhpSerializable
{
    /**
     * Allow to read value from $data array
     *
     * @param array $data
     * @return string
     * @throws MetadataReaderNotFoundException
     */
    public function getValue(array $data);
}