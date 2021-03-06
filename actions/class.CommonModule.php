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
 * Copyright (c) 2002-2008 (original work) Public Research Centre Henri Tudor & University of Luxembourg (under the project TAO & TAO2);
 *               2008-2010 (update and modification) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 *
 */

use oat\tao\model\action\CommonModuleInterface;
use oat\tao\model\security\ActionProtector;
use oat\tao\helpers\Template;
use oat\tao\helpers\JavaScript;
use oat\tao\model\routing\FlowController;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\accessControl\AclProxy;
use oat\oatbox\service\ServiceManagerAwareTrait;
use oat\oatbox\service\ServiceManagerAwareInterface;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\oatbox\log\LoggerAwareTrait;

/**
 * Top level controller
 * All children extensions module should extends the CommonModule to access the shared data
 *
 * @author CRP Henri Tudor - TAO Team - {@link http://www.tao.lu}
 * @license GPLv2 http://www.opensource.org/licenses/gpl-2.0.php
 * @package tao
 *
 */
abstract class tao_actions_CommonModule extends Module implements ServiceManagerAwareInterface, CommonModuleInterface
{
    use ServiceManagerAwareTrait { getServiceManager as protected getOriginalServiceManager; }
    use LoggerAwareTrait;

    /**
     * The Modules access the models through the service instance
     *
     * @var tao_models_classes_Service
     */
    protected $service;

    /**
     * tao_actions_CommonModule constructor.
     */
    public function __construct() {}

    /**
     * @inheritdoc
     */
    public function initialize()
    {
        /** @var ActionProtector $actionProtector */
        $actionProtector = $this->getServiceLocator()->get(ActionProtector::SERVICE_ID);
        $actionProtector->setFrameAncestorsHeader();
    }

    /**
     * Whenever or not the current user has access to a specific action
     * using functional and data access control
     *
     * @param string $controllerClass
     * @param string $action
     * @param array $parameters
     * @return boolean
     * @throws common_exception_Error
     */
    protected function hasAccess($controllerClass, $action, $parameters = [])
    {
        $user = $this->getSession()->getUser();
        return AclProxy::hasAccess($user, $controllerClass, $action, $parameters);
    }

    /**
     *
     * @see Module::setView()
     * @param string $path
     *            view identifier
     * @param string $extensionID
     *            use the views in the specified extension instead of the current extension
     */
    public function setView($path, $extensionID = null)
    {
        parent::setView(Template::getTemplate($path, $extensionID));
    }

    /**
     * Retrieve the data from the url and make the base initialization
     *
     * @return void
     * @throws common_ext_ExtensionException
     */
    protected function defaultData()
    {
        $context = Context::getInstance();

        $this->setData('extension', $context->getExtensionName());
        $this->setData('module', $context->getModuleName());
        $this->setData('action', $context->getActionName());

        if ($this->hasRequestParameter('uri')) {

            // @todo stop using session to manage uri/classUri
            $this->setSessionAttribute('uri', $this->getRequestParameter('uri'));

            // inform the client of new classUri
            $this->setData('uri', $this->getRequestParameter('uri'));
        }
        if ($this->hasRequestParameter('classUri')) {

            // @todo stop using session to manage uri/classUri
            $this->setSessionAttribute('classUri', $this->getRequestParameter('classUri'));
            if (! $this->hasRequestParameter('uri')) {
                $this->removeSessionAttribute('uri');
            }

            // inform the client of new classUri
            $this->setData('uri', $this->getRequestParameter('classUri'));
        }

        if ($this->getRequestParameter('message')) {
            $this->setData('message', $this->getRequestParameter('message'));
        }
        if ($this->getRequestParameter('errorMessage')) {
            $this->setData('errorMessage', $this->getRequestParameter('errorMessage'));
        }

        $this->setData('client_timeout', $this->getClientTimeout());
        $this->setData('client_config_url', $this->getClientConfigUrl());
    }

    /**
     * Function to return an user readable error
     * Does not work with ajax Requests yet
     *
     * @param string $description error to show
     * @param boolean $returnLink whenever or not to add a return link
     * @param int $httpStatus
     * @throws common_Exception
     */
    protected function returnError($description, $returnLink = true, $httpStatus = null)
    {
        if ($this->isXmlHttpRequest()) {
            $this->logWarning('Called '.__FUNCTION__.' in an unsupported AJAX context');
            throw new common_Exception($description);
        }

        $this->setData('message', $description);
        $this->setData('returnLink', $returnLink);

        if($httpStatus !== null && file_exists(Template::getTemplate("error/error${httpStatus}.tpl"))){
            $this->setView("error/error${httpStatus}.tpl", 'tao');
        } else {
            $this->setView('error/user_error.tpl', 'tao');
        }
    }

    /**
     * Returns the absolute path to the specified template
     *
     * @param string $identifier
     * @param string $extensionID
     * @return string
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    protected static function getTemplatePath($identifier, $extensionID = null)
    {
        if ($extensionID === true) {
            $extensionID = 'tao';
            common_Logger::d('Deprecated use of setView() using a boolean');
        }
        if($extensionID === null) {
            $extensionID = Context::getInstance()->getExtensionName();
        }
        $ext = common_ext_ExtensionsManager::singleton()->getExtensionById($extensionID);
        return $ext->getConstant('DIR_VIEWS').'templates'.DIRECTORY_SEPARATOR.$identifier;
    }

    /**
     * Helps you to add the URL of the client side config file
     *
     * @param array $extraParameters additional parameters to append to the URL
     * @return string the URL
     */
    protected function getClientConfigUrl($extraParameters = []){
        return JavaScript::getClientConfigUrl($extraParameters);
    }

    /**
     * Get the client timeout value from the config.
     *
     * @return int the timeout value in seconds
     * @throws common_ext_ExtensionException
     */
    protected function getClientTimeout(){
        $ext = $this->getServiceManager()->get(common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('tao');
        $config = $ext->getConfig('js');
        if($config !== null && isset($config['timeout'])){
            return (int)$config['timeout'];
        }
        return 30;
    }

    /**
     * Return json response.
     *
     * @param array $data
     * @param int $httpStatus
     */
    protected function returnJson($data, $httpStatus = 200) {
        header(HTTPToolkit::statusCodeHeader($httpStatus));
        Context::getInstance()->getResponse()->setContentHeader('application/json');
        echo json_encode($data);
    }

    /**
     * Returns a report
     *
     * @param common_report_Report $report
     */
    protected function returnReport(common_report_Report $report) {
        $data = $report->getData();
        $successes = $report->getSuccesses();

        // if report has no data, try to get it from the sub report
        while ($data === null && count($successes) > 0) {
            $firstSubReport = current($successes);
            $data = $firstSubReport->getData();
            $successes = $firstSubReport->getSuccesses();
        }

        if ($data !== null && $data instanceof core_kernel_classes_Resource) {
            $this->setData('selectNode', tao_helpers_Uri::encode($data->getUri()));
        }
        $this->setData('report', $report);
        $this->setView('report.tpl', 'tao');
    }

    /**
     * Forward using the TAO FlowController implementation
     * @see {@link oat\model\routing\FlowController}
     *
     * @param string $action
     * @param string $controller
     * @param string $extension
     * @param array $params
     */
    public function forward($action, $controller = null, $extension = null, $params = array())
    {
        $this->getFlowController()->forward($action, $controller, $extension, $params);
    }

    /**
     * Forward using the TAO FlowController implementation
     * @see {@link oat\model\routing\FlowController}
     *
     * @param string $url
     * @throws InterruptedActionException
     */
    public function forwardUrl($url)
    {
        $this->getFlowController()->forwardUrl($url);
    }

    /**
     * Redirect using the TAO FlowController implementation
     * @see {@link oat\model\routing\FlowController}
     * @param string $url
     * @param int $statusCode
     * @throws InterruptedActionException
     */
    public function redirect($url, $statusCode = 302)
    {
        $this->getFlowController()->redirect($url, $statusCode);
    }

    /**
     * Returns a request parameter unencoded
     *
     * @param string $paramName
     * @throws common_exception_MissingParameter
     * @return string
     */
    protected function getRawParameter($paramName)
    {
        $raw = $this->getRequest()->getRawParameters();
        if (!isset($raw[$paramName])) {
            throw new common_exception_MissingParameter($paramName);
        }
        return $raw[$paramName];
    }

    /**
     * Get the current session
     *
     * @return common_session_Session
     * @throws common_exception_Error
     */
    protected function getSession()
    {
        return common_session_SessionManager::getSession();
    }

    /**
     * Check if the current request is using AJAX
     *
     * @return bool
     */
    protected function isXmlHttpRequest()
    {
        return tao_helpers_Request::isAjax();
    }

    /**
     * Get the flow controller
     *
     * Propagate the service (logger and service manager)
     *
     * @return FlowController
     */
    protected function getFlowController()
    {
        return $this->propagate(new FlowController());
    }

    /**
     * Get the service Manager
     *
     * @deprecated Use $this->propagate or $this->registerService to access ServiceManager functionalities
     * @deprecated To get the service dependencies manager, use $this->getServiceLocator
     *
     * @return ServiceManager
     */
    protected function getServiceManager()
    {
        try {
            $serviceManager = $this->getOriginalServiceManager();
        } catch (InvalidServiceManagerException $e) {
            $serviceManager = ServiceManager::getServiceManager();
        }
        return $serviceManager;
    }
}
