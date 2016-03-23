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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\tao\model\http\HttpRange;
use oat\tao\model\http\HttpRangeException;
use Slim\Http\Stream;

/**
 * Class HttpRange
 * @package tao
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 */
class tao_test_FsAccessTest extends TaoPhpUnitTestRunner {


    protected function setUp()
    {
        parent::setUp();
    }


    /**
     * @dataProvider rangesProvider
     */
    public function testConstruct($stream, $rangeValue, $first, $last)
    {
        $range = new HttpRange($stream, $rangeValue);
        $this->assertEquals($first, $range->getFirstPos());
        $this->assertEquals($last, $range->getLastPos());
    }

    /**
     * @dataProvider wrongRangesProvider
     * @expectedException \oat\tao\model\http\HttpRangeException
     */
    public function testConstructExcept($stream, $rangeValue)
    {
        $range = new HttpRange($stream, $rangeValue);
    }


    public function wrongRangesProvider()
    {
        return [
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '0-10', //last byte more than length
            ],
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '-11', //offset from the end more than length
            ],
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '10-', //first pos more than length
            ],
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '10-11', //first pos more than length
            ],
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '10-1', //first pos less than last
            ],
        ];
    }

    /**
     * @return array
     */
    public function rangesProvider()
    {
        return [
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '0-9',
                'first' => 0,
                'last' => 9
            ],
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '0-5',
                'first' => 0,
                'last' => 5
            ],
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '5-9',
                'first' => 5,
                'last' => 9
            ],
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '3-',
                'first' => 3,
                'last' => 9
            ],
            [
                'stream' => $this->getStream('0123456789'),
                'range' => '-3',
                'first' => 7,
                'last' => 9
            ],
        ];
    }

    /**
     * @return Stream
     */
    private function getStream($string)
    {
        $resource = fopen('php://memory','r+');
        fwrite($resource, $string);
        rewind($resource);
        return new Stream($resource);
    }
}